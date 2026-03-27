Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
repo = fso.GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd.exe /k cd /d """ & repo & """ && npm run dev:direct", 0, False
