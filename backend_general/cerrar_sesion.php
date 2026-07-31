<?php
session_start();

session_unset();
session_destroy();

header("Location: /ExpertTechnicalSupport-Web/frontend/login.html");
exit;
