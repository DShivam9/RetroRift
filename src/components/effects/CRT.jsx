import React from 'react'
import './CRT.css'

export default function CRT() {
    return (
        <div className="crt-overlay">
            <div className="crt-scanlines"></div>
            <div className="crt-static"></div>
            <div className="crt-vignette"></div>
        </div>
    )
}
