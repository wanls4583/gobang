<template>
  <div class="dialog">
  	<div class="content" :style="{width:width,height:height}">
	    <slot></slot>
  	</div>
  </div>
</template>
<script type="text/javascript">
export default {
	props:{
		width:{
			type: String,
			default: '500px'
		},
		height:{
			type: String,
			default: '400px'
		}
	}
}
</script>
<style lang="scss">
	.dialog {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		width: 100%;
		height: 100%;
		background-color: rgba(0,0,0,0.3);
		.content {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			margin: auto;
		}
	}
</style>
