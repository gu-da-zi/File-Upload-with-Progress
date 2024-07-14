<?php 
$folder = "uploads/";

// 将上传的文件移动到指定文件夹中，并以时间戳和原始文件名作为文件名
move_uploaded_file($_FILES['file']['tmp_name'], $folder . time() . '_' . $_FILES['file']['name']);