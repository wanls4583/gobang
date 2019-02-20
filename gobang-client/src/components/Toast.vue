<template>
  <div class="toast">{{content}}</div>
</template>
<script type="text/javascript">
export default {
  props: {
    content: String,
    duration: {
      type: Number,
      default: 2000
    }
  },
  data() {
    return {
    }
  },
  created() {
    this.$nextTick(function() {
      this.show();
    });
  },
  destroyed() {
    this.$el.parentNode.removeChild(this.$el)
  },
  methods: {
    show() {
      setTimeout(() => {
        this.$el.style.opacity = '0';
        setTimeout(() => {
          this.$destroy();
        }, 1000);
      }, this.duration - 1000);
    }
  }
}

</script>
<style lang="scss">
.toast {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 100;
  max-width: 600px;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px 20px;
  border-radius: 6px;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: #fff;
  opacity: 1;
  transition: opacity 1s;
}

</style>
