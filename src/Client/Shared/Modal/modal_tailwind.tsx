export const modalStyle = {
    outerWrapper: 'fixed z-1000 top-0 w-full left-0',
    innerWrapper: 'first-letter:flex items-center justify-center pt-4 px-4 pb-20 text-center sm:block sm:p-0',
    transition: 'fixed inset-0 transition-opacity',
    opacity: 'absolute inset-0 bg-gray-900 opacity-75',
    hidden: 'hidden sm:inline-block sm:h-screen',
    size: 'inline-block align-center bg-white rounded-lg text-left shadow-xl transform transition-all sm:mt-[6vh]',
    header: 'flex justify-between p-6 font-normal text-2xl',
    close: 'cursor-pointer hover:font-medium',
    widthExtraLarge: 'sm:max-w-3xl',
    widthLarge: 'sm:max-w-lg',
    content: 'px-6 mb-6',
    children: 'px-6 pb-4 overflow-y-auto overflow-x-hidden max-h-[55vh]',
    childrenSiteConfig: 'px-6 overflow-y-auto overflow-x-hidden max-h-[70vh]',
    buttonWrapper: 'border-t-2 p-6 text-right',
    cancelButton: 'border-2 border-black py-2 px-4 rounded hover:bg-grey mr-2',
    confirmButton: 'border-2 border-blue-500 py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2',
    confirmButtonDisabled: 'text-white text-sm sm:text-base bg-grey hover:bg-grey rounded py-2 px-4'
}
