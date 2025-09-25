<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "freshmart");
if ($conn->connect_error) {
    echo json_encode(["error" => $conn->connect_error]);
    exit;
}

$sql = "SELECT id, name, description, category, price, discount_price, rating, image FROM products ORDER BY id DESC";
$res = $conn->query($sql);

$products = [];
if ($res) {
  while ($row = $res->fetch_assoc()) {
      $products[] = $row;
  }
}

echo json_encode($products);
$conn->close();
?>



