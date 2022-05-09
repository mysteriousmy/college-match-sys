Component({
    properties: {
      //数据集
      options: {
        type: JSON,
        value: ''
      },
      //内容层高度
      topsHeight: {
        type: String,
        value: '40%'
      },
      //遮罩层透明度
      opacity: {
        type: String,
        value: '0.5'
      },
      //是否单选
      IsSingle: {
        type: Boolean,
        value: true
      }
    },
    data: {
      isShow: false,
      contentAnimate: null, //内容动画
      overlayAnimate: null, //遮罩层动画
    },
    methods: {
  
      /**
       * 关闭
       */
      _close: function () {
        var that = this;
        this.contentAnimate.bottom("-40%").step();
        this.overlayAnimate.opacity(0).step();
        this.setData({
          contentAnimate: this.contentAnimate.export(),
          overlayAnimate: this.overlayAnimate.export(),
        });
        setTimeout(function () {
          that.setData({
            isShow: false,
          })
        }, 200)
      },
      /**
       * 显示
       */
      _show: function () {
        var that = this;
        that.setData({
          isShow: true,
        })
        // 容器上弹
        var contentAnimate = wx.createAnimation({
          duration: 200,
        })
        contentAnimate.bottom(0).step();
        //遮罩层
        var overlayAnimate = wx.createAnimation({
          duration: 250,
        })
        overlayAnimate.opacity(`${this.properties.opacity}`).step();
        this.contentAnimate = contentAnimate;
        this.overlayAnimate = overlayAnimate;
        this.setData({
          contentAnimate: contentAnimate.export(),
          overlayAnimate: overlayAnimate.export(),
        })
      },
      /**
       * 设置选中
       */
      _setSelect: function (even) {
        let data = this.data.options;
        let index = even.currentTarget.dataset.index;
        if (this.properties.IsSingle) {
          data.forEach((item, i) => {
            if (i == index) {
              item.Selected = !item.Selected;
            }
            else {
              item.Selected = false;
            }
          });
        }
        else {
          data[index].Selected = !data[index].Selected;
        }
        this.setData({
          options: data
        });
      },
      /**
       * 确定 
       * */
      _submit: function () {
        this.triggerEvent('OnSelectFinish', this.properties.options);
        this._close();
      },
      /**
       * 外部方法调用，显示组件
       */
      showPopup: function () {
        this._show();
      }
    }
  })
  