import React from 'react';
import { modalStyle } from './modal_tailwind';

export default function Modal(props: any) {
    const { children, absolute, size, handleModalClose, handleConfirm, modal_header, modal_content, isConfirm, confirmBtnName, isCancel, cancelBtnName, confirmBtnDisabled, isConfigSite } = props;

    return (
        <div id="modal" className={modalStyle.outerWrapper}>
            <div className={modalStyle.innerWrapper}>
                <div className={modalStyle.transition}>
                    <div className={modalStyle.opacity} />
                </div>
                <span className={modalStyle.hidden}>&#8203;</span>
                <div className={`${modalStyle.size} ${size === 'large' ? 'sm:max-w-5xl' : 'sm:max-w-lg'} sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline"`}>
                    <div className={modalStyle.header}>
                        <div>{modal_header}</div>
                        <div onClick={handleModalClose} className={modalStyle.close}>X</div>
                    </div>
                    {/* Content */}
                    {modal_content && (
                        <div className={modalStyle.content}>
                            <p>
                                {modal_content}
                            </p>
                        </div>
                    )}
                    {/* Render children */}
                    {children && (
                        <div className={isConfigSite? modalStyle.childrenSiteConfig: modalStyle.children}>
                            {children}
                        </div>
                    )}
                    <div className={modalStyle.buttonWrapper}>
                        {isCancel && (
                            <button
                                type="button"
                                className={modalStyle.cancelButton}
                                onClick={handleModalClose}
                            >
                                {cancelBtnName}
                            </button>
                        )}
                        {isConfirm && (
                            <button
                                type="button"
                                className={confirmBtnDisabled ? modalStyle.confirmButtonDisabled : modalStyle.confirmButton}
                                onClick={handleConfirm}
                                disabled={confirmBtnDisabled}
                            >
                                {confirmBtnName}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
