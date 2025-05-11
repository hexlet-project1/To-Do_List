import subprocess
def free_port(port):
  cmd = f"lsof -ti :{port}"
  result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
  if result.stdout.strip():
    pids = result.stdout.strip().split('\n')
    for pid in pids:
      subprocess.run(['kill', '-9', pid])