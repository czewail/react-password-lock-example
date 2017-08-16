import React, { Component } from 'react'
import CircleComponent from '../components/Circle'

import '../styles/app.less'


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      R: 31, // 每个圆的半径
      canvasWidth: 0, // 画布宽度
      canvasHeight: 0, // 画布高度
      canvasOffsetTop: 0, // 画布距离顶部高度
      circlesPoint: [], // 所有圆心位置
      pwdArr: [], // 获取到的密码数组
      touchX: 0, // 触摸位置的横坐标
      touchY: 0, // 触摸位置的纵坐标
      lines: []
    }
  }
  // 初始化画布设置
  _initCanvas = (e) => {
    // 去除微信浏览器默认事件
    document.addEventListener('touchmove', function(e){e.preventDefault()}, false)
    this.state = {
      ...this.state,
      canvasWidth: e.clientWidth,
      canvasHeight: e.clientHeight,
      canvasOffsetTop: e.offsetTop
    }
  }

  // 初始化每个圆的位置信息，每个子组件传过来的参数
  _handleInitCirclesPoint = (x, y) => {
    // 圆心坐标
    let Point = {
      x: x,
      y: y
    }
    this.state.circlesPoint.push(Point)
  }

  // 设置图形的密码
  _handleSetPassword = (x, y) => {
    const {circlesPoint, R} = this.state
    for (var i = 0; i < circlesPoint.length; i++) {
      // 当前循环的圆
      let currentPoint = circlesPoint[i]
      let mathX = Math.abs(currentPoint.x - x)
      let mathY = Math.abs(currentPoint.y - y)
      let mathR = Math.pow((mathX * mathX + mathY * mathY), 0.5)
      // 点击的半径超过圆的半径或者已经包含设定过的值，则跳过
      if (mathR > R || this.state.pwdArr.includes(i)) {
        continue
      }
      this.state.pwdArr.push(i)
      break
    }
  }

  // 开始触摸事件
  _handleTouchStart = (e) => {
    this.state = {
      ...this.state,
      pwdArr: [],
      lines: [],
      touchX: e.targetTouches[0].clientX,
      touchY: e.targetTouches[0].clientY,
    }
    this._handleSetPassword(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
  }
  // 触摸滑动事件
  _handleTouchMoven = (e) => {
    this.setState({
      touchX: e.targetTouches[0].clientX,
      touchY: e.targetTouches[0].clientY,
    })
    this._handleSetPassword(e.targetTouches[0].clientX, e.targetTouches[0].clientY)
    this._drawLines()
  }
  // 触摸结束事件
  _handleRouchEnd = (e) => {
    const {circlesPoint, pwdArr, lines, R, touchX, touchY} = this.state
    // lines.pop()
    // console.log(lines)

    if (circlesPoint.length > 0) {
      let a = false
      for (let i = 0; i < circlesPoint.length; i++) {
        // 当前循环的圆
        let currentPoint = circlesPoint[i]
        let mathX = Math.abs(currentPoint.x - touchX)
        let mathY = Math.abs(currentPoint.y - touchY)
        let mathR = Math.pow((mathX * mathX + mathY * mathY), 0.5)
        // 在圆内，继续查找
        if (mathR > R || pwdArr.includes(i)) {
          // 如果到最后一个节点
          if (circlesPoint.length - 1 === i) {
            a = true
          }
          continue
        }
      }
      if (a) {
        lines.pop()
        this.setState({
          lines: lines
        })
      }
    }

  }

  // 计算属性
  _computeDeg(x, y, px, py){
    // x 当前位置x
    // y 当前位置y
    // px 固定点位置x
    // py 固定点位置y
    let mathX = Math.abs(px - x)
    let mathY = Math.abs(py - y)
    let mathR = Math.pow((mathX * mathX + mathY * mathY), 0.5)

    // 计算两个节点之间的角度
    let radina =  Math.asin(mathY / mathR) // 利用反三角函数求出弧度
    var angle = Math.floor(180 / (Math.PI / radina)) //将弧度转换成角度

    // 点在圆心坐标系的Y轴负方向上
    if (x === px && y > py) {
      angle = 90
    }
    // 点在圆心坐标系的Y轴正方向上
    if (x === px && y < py) {
      angle = 270
    }
    // 点在圆心坐标系的X轴正方向上
    if (x > px && y === py) {
      angle = 0
    }
    // 点在圆心坐标系的X轴负方向上
    if (x < px && y === py) {
      angle = 180
    }
    // 点在圆心坐标系的第三象限
    if (x < px && y > py) {
      angle = 180 - angle
    }
    // 点在圆心坐标系的第二象限
    if (x < px && y < py) {
      angle = 180 + angle
    }
    // 点在圆心坐标系的第一象限
    if (x > px && y < py) {
      angle = 360 - angle
    }
    return {
      angle: angle, // 相对于x轴的顺时针方向的角度, 用于css3的tansform
      x: mathX, // 点到圆心的X轴上的长度
      y: mathY, // 点到圆心的Y轴上的长度
      r: mathR // 点到圆心的直接长度
    }
  }

  // 画线条
  _drawLines = () => {
    const {pwdArr, touchX, touchY, circlesPoint} = this.state
    const lineComponents = []
    if (pwdArr.length > 0) {
      // 已经生成的线条
      //
      for (let i = 0; i < pwdArr.length; i++) {
        // 存在当前节点和下一个节点
        if (pwdArr[i] >= 0 && pwdArr[i + 1] >= 0) {
          let currentPoint = circlesPoint[pwdArr[i]]
          let nextPoint = circlesPoint[pwdArr[i + 1]]
          let maths = this._computeDeg(nextPoint.x, nextPoint.y, currentPoint.x, currentPoint.y)
          let line = (
            <div key={i} className="line" style={{
              left: currentPoint.x,
              top: currentPoint.y,
              width: maths.r,
              transformOrigin: 'left',
              transform: `rotate(${maths.angle}deg)`
            }}/>
          )
          lineComponents.push(line)
        }
      }
      // 跟随滑动点移动的线条
      //
      let currentPoint = circlesPoint[pwdArr[pwdArr.length - 1]]
      let maths = this._computeDeg(touchX, touchY, currentPoint.x, currentPoint.y)
      let line = (
        <div key={'lineTouch'} className="line" style={{
          left: currentPoint.x,
          top: currentPoint.y,
          width: maths.r,
          transformOrigin: 'left',
          transform: `rotate(${maths.angle}deg)`
        }}/>
      )
      lineComponents.push(line)
    }
    // console.log(lineComponents)
    this.setState({
      lines: lineComponents
    })
  }

  // 设置每行3个圆
  _getCirclesRow = () => {
    const circles = []
    for (var i = 0; i < 3; i++) {
      const circleProps = {
        R: this.state.R,
        _handleInitCirclesPoint: this._handleInitCirclesPoint
      }
      circles.push(circleProps)
    }
    return circles
  }

  render() {
    return (
      <div className="container">
        <div className="header">

        </div>
        <div
          className="canvas"
          ref={this._initCanvas}
          onTouchStart={this._handleTouchStart}
          onTouchMove={this._handleTouchMoven}
          onTouchEnd={this._handleRouchEnd}
        >
          <div className="circles">
            {this._getCirclesRow().map((item, index) => {
              return (
                <CircleComponent key={index} {...item}/>
              )
            })}
          </div>
          <div className="circles">
            {this._getCirclesRow().map((item, index) => {
              return (
                <CircleComponent key={index} {...item}/>
              )
            })}
          </div>
          <div className="circles">
            {this._getCirclesRow().map((item, index) => {
              return (
                <CircleComponent key={index} {...item}/>
              )
            })}
          </div>
          <div className="lines">
            {this.state.lines}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
