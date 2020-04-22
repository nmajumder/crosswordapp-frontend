import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { Stage, Layer, Shape, Text } from 'react-konva';

class ColorSchemeRow extends Component {

    render () {
        const width = this.props.width
        const height = this.props.height
        return (
            <Stage width={width} height={height}>
                <Layer>
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath()
                            context.moveTo(0,0)
                            context.lineTo(0, height)
                            context.lineTo(width / 3, 0)
                            context.closePath()
                            context.fillStrokeShape(shape)
                        }}
                        fill={this.props.colorScheme.colors[3]}
                        stroke="black"
                        strokeWidth={1}
                    />
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath()
                            context.moveTo(0, height)
                            context.lineTo(width / 3, 0)
                            context.lineTo(width * 2 / 3, 0)
                            context.lineTo(width / 3, height)
                            context.closePath()
                            context.fillStrokeShape(shape)
                        }}
                        fill={this.props.colorScheme.colors[2]}
                        stroke="black"
                        strokeWidth={1}
                    />
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath()
                            context.moveTo(width / 3, height)
                            context.lineTo(width * 2 / 3, 0)
                            context.lineTo(width, 0)
                            context.lineTo(width * 2 / 3, height)
                            context.closePath()
                            context.fillStrokeShape(shape)
                        }}
                        fill={this.props.colorScheme.colors[1]}
                        stroke="black"
                        strokeWidth={1}
                    />
                    <Shape
                        sceneFunc={(context, shape) => {
                            context.beginPath()
                            context.moveTo(width * 2 / 3, height)
                            context.lineTo(width, 0)
                            context.lineTo(width, height)
                            context.closePath()
                            context.fillStrokeShape(shape)
                        }}
                        fill={this.props.colorScheme.colors[0]}
                        stroke="black"
                        strokeWidth={1}
                    />
                </Layer>
            </Stage>
        )
    }
}

ColorSchemeRow.propTypes = {
    colorScheme: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
}

export default ColorSchemeRow