import React from 'react'
import './App.css';

export const WaveComponent = props => {
    return (
        <div className='wave'>
            <h5>{props.wave.message ? props.wave.message : "No Message :( "}</h5>
            <div className='info'>
                <p>{props.wave.address}</p>
                <p id="timestamp">{props.wave.timestamp.toString().substr(0, 21)}</p>
            </div>
        </div>
    )
}