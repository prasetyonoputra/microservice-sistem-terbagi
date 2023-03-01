<?php
require_once('../config/koneksi.php');

if (isset($_POST['id'])) {
	$id   	= $_POST['id'];
	$nama_barang   	= $_POST['nama_barang'];
	$deskripsi	    = $_POST['deskripsi'];
	$stok 			= $_POST['stok'];
	$unit 			= $_POST['unit'];
	$harga      	= $_POST['harga'];
	$created_up	    = $_POST['created_up'];
	$update_up 		= $_POST['update_up'];
    $query = "UPDATE barang SET
				nama_barang = '$nama_barang',
				deskripsi = '$deskripsi',
				stok = '$stok',
				unit = '$unit',
				harga = '$harga',
				created_up = '$created_up',
				update_up = '$update_up'
			  WHERE id = $id
			";

	mysqli_query($conn, $query);
    echo json_encode(array('RESPONSE' => 'SUKSES'));
} else {
        echo json_encode(array('RESPONSE' => 'FAILED'));
    }
