"""
Push all git-tracked files to GitHub using the GitHub API.
Uses the Contents API to create/update files via tree+commit approach.
"""
import subprocess
import base64
import json
import os
import sys
import urllib.request
import urllib.error

OWNER = "SurgeACE"
REPO = "md-viewer"
BRANCH = "main"
COMMIT_MSG = "backup: pre-AI refine feature"

# Corporate proxy
PROXY = "http://proxy-dmz.intel.com:912"

def get_token():
    """Try to get GitHub token from environment or gh CLI."""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if token:
        return token
    # Try gh CLI
    try:
        result = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True, timeout=10)
        if result.returncode == 0 and result.stdout.strip():
            return result.stdout.strip()
    except Exception:
        pass
    return None

def api_request(url, method="GET", data=None, token=None):
    """Make a GitHub API request through corporate proxy."""
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "push-script",
    }
    if token:
        headers["Authorization"] = f"token {token}"
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        body = None
    
    # Set up proxy handler
    proxy_handler = urllib.request.ProxyHandler({
        "http": PROXY,
        "https": PROXY,
    })
    opener = urllib.request.build_opener(proxy_handler)
    
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with opener.open(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8") if e.fp else ""
        print(f"API Error {e.code}: {e.reason}")
        print(f"URL: {url}")
        print(f"Response: {error_body[:500]}")
        raise

def main():
    token = get_token()
    if not token:
        print("ERROR: No GitHub token found. Set GITHUB_TOKEN env var or login with 'gh auth login'.")
        sys.exit(1)
    
    print(f"Token found (length: {len(token)})")
    
    # Get list of git-tracked files
    result = subprocess.run(["git", "ls-files"], capture_output=True, text=True, cwd=os.path.dirname(__file__))
    files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
    print(f"Found {len(files)} git-tracked files")
    
    base_url = f"https://api.github.com/repos/{OWNER}/{REPO}"
    
    # Step 1: Get the current commit SHA for the branch (or handle empty repo)
    try:
        ref_data = api_request(f"{base_url}/git/ref/heads/{BRANCH}", token=token)
        parent_sha = ref_data["object"]["sha"]
        commit_data = api_request(f"{base_url}/git/commits/{parent_sha}", token=token)
        base_tree_sha = commit_data["tree"]["sha"]
        print(f"Current HEAD: {parent_sha[:8]}")
        has_parent = True
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("Branch not found — will create initial commit")
            parent_sha = None
            base_tree_sha = None
            has_parent = False
        else:
            raise
    
    # Step 2: Create blobs for each file
    tree_items = []
    workspace = os.path.dirname(os.path.abspath(__file__))
    
    for i, filepath in enumerate(files):
        full_path = os.path.join(workspace, filepath)
        if not os.path.exists(full_path):
            print(f"  SKIP (missing): {filepath}")
            continue
        
        # Read file as bytes
        with open(full_path, "rb") as f:
            content_bytes = f.read()
        
        content_b64 = base64.b64encode(content_bytes).decode("ascii")
        
        # Create blob
        blob_data = api_request(
            f"{base_url}/git/blobs",
            method="POST",
            data={"content": content_b64, "encoding": "base64"},
            token=token,
        )
        
        tree_items.append({
            "path": filepath.replace("\\", "/"),
            "mode": "100644",
            "type": "blob",
            "sha": blob_data["sha"],
        })
        
        print(f"  [{i+1}/{len(files)}] {filepath} -> blob {blob_data['sha'][:8]}")
    
    print(f"\nCreated {len(tree_items)} blobs")
    
    # Step 3: Create tree
    tree_payload = {"tree": tree_items}
    if base_tree_sha:
        tree_payload["base_tree"] = base_tree_sha
    
    tree_data = api_request(
        f"{base_url}/git/trees",
        method="POST",
        data=tree_payload,
        token=token,
    )
    print(f"Created tree: {tree_data['sha'][:8]}")
    
    # Step 4: Create commit
    commit_payload = {
        "message": COMMIT_MSG,
        "tree": tree_data["sha"],
    }
    if has_parent:
        commit_payload["parents"] = [parent_sha]
    else:
        commit_payload["parents"] = []
    
    new_commit = api_request(
        f"{base_url}/git/commits",
        method="POST",
        data=commit_payload,
        token=token,
    )
    print(f"Created commit: {new_commit['sha'][:8]}")
    
    # Step 5: Update branch ref
    try:
        api_request(
            f"{base_url}/git/refs/heads/{BRANCH}",
            method="PATCH",
            data={"sha": new_commit["sha"], "force": True},
            token=token,
        )
        print(f"Updated refs/heads/{BRANCH}")
    except urllib.error.HTTPError as e:
        if e.code == 404 or (not has_parent):
            # Create the ref
            api_request(
                f"{base_url}/git/refs",
                method="POST",
                data={"ref": f"refs/heads/{BRANCH}", "sha": new_commit["sha"]},
                token=token,
            )
            print(f"Created refs/heads/{BRANCH}")
        else:
            raise
    
    print(f"\n✅ Successfully pushed {len(tree_items)} files to {OWNER}/{REPO} @ {BRANCH}")
    print(f"   Commit: {new_commit['sha']}")
    print(f"   URL: https://github.com/{OWNER}/{REPO}/tree/{BRANCH}")

if __name__ == "__main__":
    main()
