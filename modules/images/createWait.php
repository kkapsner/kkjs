<?php
include_once("../../../PHP/init.php");

$bild = imageCreateFromPNG("./wait_1.png");
$original = new ImageManipulator($bild);

$width = $original->getWidth();
$height = $original->getHeight();

$delay = array();
$size = 8;
$time = 0.75;

header("Content-Type: image/gif");
echo "GIF89a" . $original->getLogicalScreenDescriptor() . ImageManipulator::getAnimationExtension();

for ($i = 1; $i <= $size; $i++){
	$img = new Image(32, 32);
	$img->fill(0, 0, new Color(255, 255, 255));
	$original = imageCreateFromPNG("./wait_" . $i . ".png");
	$img->copy($original, 0, 0, 0, 0, 32, 32);
	$changed = new ImageManipulator($img);	
	echo $changed->getGIFFrameBlock($time / $size * 100);
}

echo chr(0x3B);

?>