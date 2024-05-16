import React from 'react'
import { CONSTANTS } from '../../../Constants/constants';
import { tooltipStyle } from './tooltip_tailwind';

export default function Tooltip(props: any) {
    const { reasonCodes } = props
    return (
        <div className={tooltipStyle.tooltipOuterWrapper}>
            <div>
                <span className={tooltipStyle.tooltipLabel}>{CONSTANTS.NOT_INSTALLED_REASON}</span>
                <button className={tooltipStyle.tooltipButton} type="button"
                >
                    i
                </button>
            </div>
            <div className={tooltipStyle.tooltipInnerWrapper}>
                <span className={tooltipStyle.tooltipSpan}>{CONSTANTS.NOT_INSTALLED_REASON_DESC} </span> <br /> <br />
                {reasonCodes?.map((option: any) => (
                    <div
                        key={option.value}
                    >
                        <span className={tooltipStyle.tooltipSpan}>{option.label}</span> <br /><br />
                        <span className={tooltipStyle.tooltipLabel}>{option.value}</span><br /><br />
                    </div>
                ))}
            </div>
        </div>
    )
}
