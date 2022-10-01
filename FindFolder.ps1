$dirPath = "E:\CodeBase\"
$searchInput = Read-Host "Enter a file name: "
$filter = "*$searchInput*"
$files = Get-ChildItem -Recurse -filter: $filter -Directory -Path: $dirPath -Depth 1
$hash = @{}
$index = 1
foreach($file in $files){
    $hash.Add($index, $file.FullName)
    $index++
}
$hash.GetEnumerator() | Sort-Object -Property Name 
$selected = Read-Host "Enter indexed Number: "
$path = $hash.item([int]$selected)
Start-Process $path