import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { Stage, Layer, Line } from 'react-konva';

class CrosswordSquareSlash extends Component {

    render () {
        const width = this.props.width
        const height = this.props.height
        if (!this.props.hidden) {
            return (
                <Stage width={width} height={height}>
                    <Layer>
                        <Line 
                            points={[0, height, width, 0]}
                            stroke="red"
                            strokeWidth={2}
                        />
                    </Layer>
                </Stage>
            )
        } else {
            return null
        }   
    }
}

CrosswordSquareSlash.propTypes = {
    hidden: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
}

export default CrosswordSquareSlash