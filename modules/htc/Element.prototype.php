<?php header("Content-type: text/x-component");?><PUBLIC:COMPONENT>
	<PUBLIC:METHOD NAME="<?php echo $_GET['func'];?>" INTERNALNAME="_<?php echo $_GET['func'];?>"/>
	<SCRIPT LANGUAGE="JScript" type="text/javascript">
		if (element != window.<?php echo $_GET['nodeName'];?>.prototype){
			_<?php echo $_GET['func'];?> = function(){ return window.<?php echo $_GET['nodeName'];?>.prototype.<?php echo $_GET['func'];?>.apply(this, arguments);};
		}
	</SCRIPT>
</PUBLIC:COMPONENT>