import React from 'react'


function Spinner() {
    const displayloading = false
    return (
        <>
            {displayloading && (
                <>
                    <div className='pos-center'>
                        <div className="loader"></div>
                    </div>
                </>
            )
            }
        </>
    )
}

export default Spinner
    