<?php
require_once('../config/koneksi.php');

if (isset($_POST['nama_barang']) && isset($_POST['deskripsi']) && isset($_POST['stok']) && isset($_POST['unit']) && isset($_POST['harga']) && isset($_POST['created_up']) && isset($_POST['update_up'])) {
	$nama_barang   	= $_POST['nama_barang'];
	$deskripsi	    = $_POST['deskripsi'];
	$stok 			= $_POST['stok'];
	$unit 			= $_POST['unit'];
	$harga      	= $_POST['harga'];
	$created_up	    = $_POST['created_up'];
	$update_up 		= $_POST['update_up'];
	// $sql = $conn->prepare("INSERT INTO barang (nama_barang, deskripsi, stok, unit, harga, created_up, update_up) VALUES (?, ?, ?, ?, ?, ?, ?)");
	// $sql->bind_param($nama_barang, $deskripsi, $stok, $unit,  $harga, $created_up , $update_up);
	// $sql->execute();
	// if ($sql) {
	// 	//echo json_encode(array('RESPONSE' => 'SUCCESS'));
	// 	header("location:../readapi/tampil.php");
	// } else {
	// 	echo json_encode(array('RESPONSE' => 'FAILED'));
	// }
    $query = "INSERT INTO barang ( nama_barang  ,  deskripsi ,  stok ,  unit ,  harga ,  created_up ,  update_up )
				VALUES
			  ( '$nama_barang ', '$deskripsi', '$stok', '$unit', '$harga', '$created_up', '$update_up')
			";
	$row = mysqli_query($conn, $query);
     
	echo "SUKSES";

} else {
	echo "GAGAL";
}
