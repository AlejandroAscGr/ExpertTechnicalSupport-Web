<?php
session_start();

session_unset();
session_destroy();
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
    
header("Location: /ExpertTechnicalSupport-Web/frontend/login.html");
exit;
?>