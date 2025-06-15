<?php
session_start();

// Reset rate limiting
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_key = 'register_' . $ip;
$_SESSION[$rate_limit_key] = ['count' => 0, 'time' => time()];

echo json_encode(['success' => true, 'message' => 'Rate limit resetado para o IP: ' . $ip]);
?>
