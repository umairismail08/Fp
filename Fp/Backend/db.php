<?php
$host = "localhost";
$user = "root"; // default in XAMPP
$pass = "";     // default password is empty
$dbname = "freshmart";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
