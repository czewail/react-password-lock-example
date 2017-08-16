import React from 'react'

class CircleComponent extends React.Component {

  // 设置每个圆形圆心的坐标
  _handleConRef = (e) => {
    const {R} = this.props
    this.props._handleInitCirclesPoint(e.offsetLeft + R, e.offsetTop + R)
  }

  render() {
    return (
      <div className='circleItem'>
        <div className="circleCon" ref={this._handleConRef}>
          <div className="circleCore">

          </div>
        </div>
      </div>
    )
  }
}

export default CircleComponent
