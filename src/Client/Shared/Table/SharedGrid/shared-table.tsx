import React from 'react'
import { commonTableMetricStyle } from '../table_tailwind';

/**
 * Function Generate common Table structure
 * @param props 
 * @returns 
 */
function SharedTable(props: any) {
  const { tableHeaders, isCustomHeader, getCustomHeaderContent } = props;

  const getHeaderContent = (headerText: string) => {
    if (!isCustomHeader(headerText))
      return <th key={headerText} scope="col" className={"pl-4 mb-10 py-4 text-grey4 font-normal text-center"}>{headerText}</th>
    else
      return getCustomHeaderContent(headerText);
  }
  const renderHeaders = () => {
    if (tableHeaders) {
      return (tableHeaders && tableHeaders.map((header: any, index: any) => {
        return getHeaderContent(header);
      }));
    }
  };

  return (
    <div>
      <div className={commonTableMetricStyle.outerContainer}>
        <div className={commonTableMetricStyle.outerContainerOverflow}>
          <div className={commonTableMetricStyle.containerWidth}>
            <div className={commonTableMetricStyle.wrapperOverflow}>
              <table className={commonTableMetricStyle.tableWrapper}>
                <thead
                  className={commonTableMetricStyle.tableHead}>
                  <tr className={`${commonTableMetricStyle.tBodyTr} ${commonTableMetricStyle.centerAlign}`}>
                    {renderHeaders()}
                  </tr>
                </thead>
                <tbody className={commonTableMetricStyle.tableBody}>
                  {<>
                    {props.children}

                  </>
                  }

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedTable;
