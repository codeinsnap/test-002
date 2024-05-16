import React, { useEffect, useMemo, useRef, useState } from "react";
import Timeline, { TimelineMarkers, CustomMarker, TimelineHeaders, SidebarHeader, DateHeader } from "react-calendar-timeline";
import "react-calendar-timeline/lib/Timeline.css";
import moment from "moment";
import { gnatt_chart_1_tailwind } from "./gnatt_chart_tailwind";
import { Tooltip } from "react-tooltip";

import { handleNewGroups, splitTimeSlotsByBreaks, entiresBeforeShiftTimings } from "./gnatt_chat_helper";
import { TBreak, TPlannedData, TRawPlannedData, Tgroup } from "./gnatt_chart_types";
import response from '../../../Constants/response.json'

const currentDate = new Date();
const currentDateString = currentDate.toISOString().slice(0, 10);

type TGnattChartProps = {
  groups: Tgroup;
  breaks: TBreak[];
  plannedData: TRawPlannedData[];
  vinTimeDuration: {
    fromTime: number | null,
    toTime: number | null
  },
  isFilteredApplied: boolean
  timeFilters: {fromTime: string, toTime: string}
  dataRefreshedTIme: number
}

export default function GnattChart({groups, breaks, plannedData, isFilteredApplied, timeFilters, vinTimeDuration, dataRefreshedTIme}: TGnattChartProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(14); // Assuming 5 elements per page
  const [vehilceGroupData, setVehilceGroupData] = useState<any[]>([])
  const [updateChart, setUpdateChart] = useState('')
  const vehicleData = response
  const { ShiftDetails, shopDetail, timeZone, CompletedData } = (vehicleData as any)?.vehilceTimeSheet;
  const timelineRef = useRef(null)

  const localOffset = moment().utcOffset();
  const timezoneOffset = moment().tz(timeZone ?? "America/Los_Angeles").utcOffset();
  const today = moment()
    .add(timezoneOffset - localOffset, "m")
    .valueOf();
  const newCurrentTime = `${currentDateString} ${moment(today).format("HH:mm:ss")}`;
  const updated = moment(newCurrentTime, "YYYY-MM-DD HH:mm:ss");

  const groupsWithExtraRow = useMemo(() => { return handleNewGroups(groups ?? []) ?? []}, [groups]);
  const listExcludingShiftTime = useMemo(() => { return entiresBeforeShiftTimings(groupsWithExtraRow ?? [], ShiftDetails?.shiftTime, moment(today).format("HH:mm:ss"))}, [ShiftDetails?.shiftTime, groupsWithExtraRow]);

  useEffect(() => {

    if (groupsWithExtraRow.length > 0 && !isFilteredApplied) {
      setVehilceGroupData(groupsWithExtraRow.slice(0, 14) as any)
      setStartIndex(0)
      setEndIndex(14)
    } else {
      setVehilceGroupData(groupsWithExtraRow as any)
    }

  }, [groupsWithExtraRow, isFilteredApplied])

  const breakTimes = useMemo(() => {
    return breaks?.map((breakItem: TBreak) => ({
      start: new Date(`${currentDateString}T${breakItem?.breakStart}`),
      end: new Date(`${currentDateString}T${breakItem?.breakEnd}`),
    }));
  }, [breaks]);

  const updatedCompleteData = splitTimeSlotsByBreaks(breaks, CompletedData, moment(today).format('HH:mm:ss'))
  const entriesIncludingBreakandShfitTime = useMemo(() => {return splitTimeSlotsByBreaks(breaks ?? [], plannedData ?? [])}, [breaks, plannedData]);

  let dateHeaderUnit = "primaryHeader";
  const getStartTimeAndEndTime=()=>{
    const hour = 60 * 60 * 1000;
    const time = {
      start: moment(updated).subtract(1, 'hour'),
      end:  moment(updated).add(2, 'hours')
    }
    if (timeFilters.fromTime) {
      time.start = moment(`${currentDateString} ${timeFilters.fromTime}:00`)
    } 
    else if (vinTimeDuration.fromTime) {
      time.start = moment(vinTimeDuration.fromTime)
    }
    if(timeFilters.toTime){
      time.end = moment(`${currentDateString} ${timeFilters.toTime}:00`);
    } else if(vinTimeDuration.toTime){
      time.end = moment(vinTimeDuration.toTime)
    }
    if(time.start && time.end && (time.end.valueOf() - time.start.valueOf()) <= hour ){
      dateHeaderUnit="hour"
    }
    return time
  }
  const visibleDuration = getStartTimeAndEndTime();
  const startTime = visibleDuration.start;
  const endTime = visibleDuration.end;

  useEffect(() => {
    if (startIndex > 0 && endIndex > 14) {
      if (timeFilters.fromTime && timeFilters.toTime) {
        setUpdateChart(`${startTime?.toISOString()}-${endTime?.toISOString()}`)
        !isFilteredApplied && timelineRef?.current && (timelineRef?.current as any)?.scrollTo({top: 25, behavior: 'smooth'})
      } else {
        !isFilteredApplied && timelineRef?.current && (timelineRef?.current as any)?.scrollTo({top: 25, behavior: 'smooth'})
      }
    } else {
      setUpdateChart(`${startTime?.toISOString()}-${endTime?.toISOString()}`)
    }
  }, [endIndex, endTime, startIndex, startTime, vehilceGroupData, timeFilters, isFilteredApplied])

  const handleTimelineData = useMemo(() => {
    return (startTime: Date, endTime: Date, item: TPlannedData, index: number) => {
      let findIndex = (groupsWithExtraRow ?? [])?.findIndex((element) => element.stall === item.stall && element.prod_line === item.prod_line);
      return {
        id: index,
        group: item.actual_start_time || item.actual_end_time ? findIndex + 2 : findIndex + 1,
        title: item.serial_no,
        start_time: startTime,
        end_time: endTime,
        prod_line: item.prod_line,
        itemData: item,
        prevtime: item.prevtime ?? "",
      };
    };
  }, [groupsWithExtraRow]);

  const timeLineItems = [...entriesIncludingBreakandShfitTime, ...listExcludingShiftTime, ...updatedCompleteData]?.map((item: TPlannedData, index: number) => {
    const start = new Date(`${currentDateString}T${item?.actual_start_time || item.planned_start_time}`);
    const end = new Date(`${currentDateString}T${item?.actual_end_time || item?.planned_end_time}`);
    return handleTimelineData(start, end, item, index);
  });

  const handleFindLineName = (value: string) => {
    const label = (shopDetail ?? [])?.find((element: { id: string; description: string }) => element.id == value);
    const displayValue = `${label?.description.length > 12 ? (label?.description ?? "")?.substring(0, 12) : label?.description} (${value})`;
    return displayValue;
  };

  const renderGroup = (group: any) => {
    return (
      <div className="custom-group">
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center break-words">{group.group.prod_line ? handleFindLineName(group?.group?.prod_line) : ""}</div>
          <div className="text-center">{group.group.prod_line ? `Stall ${group?.group?.stall}` : ""}</div>
        </div>
      </div>
    );
  };

  const showTooltipDetials = (item: any) => {
    return (
      <div>
        <div>VIN: {item?.itemData?.vin ?? ""}</div>
        <div>Planned Start Time: {item?.prevtime?.start ?? item?.itemData?.planned_start_time ?? ""}</div>
        <div>Planned End Time: {item?.prevtime.end ?? item?.itemData?.planned_end_time ?? ""}</div>
        <div>Std Install Time: {item?.itemData?.std_install_time ?? ""}</div>
        <div>Model Year: {item?.itemData?.model_year ?? ""}</div>
        <div>Model Type: {item?.itemData?.model_type ?? ""}</div>
        {item.itemData?.actual_start_time && <div>Actual Start Time: {item.itemData?.actual_start_time ?? ""}</div>}
        {item.itemData?.actual_end_time && <div>Actual End Time: {item.itemData?.actual_end_time ?? ""}</div>}
      </div>
    );
  };

  const handleItemRenderer = ({ item, getItemProps }: any) => {
    if (!item || !getItemProps) return <></>;

    const newItemProps = { ...getItemProps(item) };
    const { end_time, start_time } = item as any;

    const handleMouseEnter = (e: any) => {
      const el = e.target;
      if (el) {
        el.parentElement.removeAttribute("title");
      }
    };

    let color = "white";
    let showTooltip = true;

    if (item.itemData.style) {
      showTooltip = false
      newItemProps.style = {
        ...newItemProps.style,
        ...item.itemData.style
      }
    } else {
      for (const breakTime of breakTimes) {
        if (start_time <= breakTime.start && end_time >= breakTime.end) {
          showTooltip = false;
          newItemProps.style = {
            ...newItemProps.style,
            background: "gray",
            borderColor: "gray",
            color: "gray",
            zIndex: "99",
          };
        }
      }
      if (item.itemData?.planned_start_time <= "00:00:00" || item?.itemData?.planned_end_time === "23:59:59") {
        showTooltip = false;
        newItemProps.style = {
          ...newItemProps.style,
          background: "gray",
          borderColor: "gray",
          color: "gray",
          zIndex: "10",
        };
      }
      if (item.itemData?.planned_start_time == ShiftDetails?.shiftTime?.start && item?.itemData?.planned_end_time === ShiftDetails?.shiftTime?.end) {
        showTooltip = false;
        newItemProps.style = {
          ...newItemProps.style,
          background: "white",
          borderColor: isFilteredApplied ? "white" : "black",
          color: "white",
          zIndex: "10",
        };
      }
      if (item?.itemData?.vin && item?.itemData?.serial_no) {
        color = "#FFE4D4";
        showTooltip = true;
        newItemProps.style = {
          ...newItemProps.style,
          background: color,
          borderColor: "black",
          color: "black",
        };
      }
      if (item?.itemData?.isAfterBreak) {
        color = "#FFE4D4";
        showTooltip = true;
        newItemProps.style = {
          ...newItemProps.style,
          background: color,
          borderColor: "black",
          color: "#FFE4D4",
        };
      }
    }

    return (
      <>
        <div {...newItemProps} onMouseEnter={handleMouseEnter}>
          <div id={`tooltip-${item.id}`} data-tooltip-position-strategy={"fixed"}>
            {item.title ?? ""}
          </div>
        </div>
        <div>
          {showTooltip && (
            <Tooltip className="fixed" anchorSelect={`#tooltip-${item.id}`} place={"bottom"} style={{ zIndex: 10000 }}>
              {showTooltipDetials(item)}
            </Tooltip>
          )}
        </div>
      </>
    );
  };

  const handleScroll = (event : any) => {
    if (!isFilteredApplied) {
      const timelineWrapper = event.target;
      const bottom = timelineWrapper.scrollHeight - Math.ceil(timelineWrapper.scrollTop) === timelineWrapper.clientHeight;
      const top = timelineWrapper.scrollTop === 0;  
      if (groupsWithExtraRow.length > 5) {
        if (bottom && endIndex < groupsWithExtraRow.length - 1) {
          setVehilceGroupData(groupsWithExtraRow.slice(startIndex + 6, endIndex + 6))
          setStartIndex(startIndex + 6);
          setEndIndex(endIndex + 6);      
        } else if (top && startIndex > 0) {
          setVehilceGroupData(groupsWithExtraRow.slice(startIndex - 6, endIndex - 6))
          setStartIndex(startIndex - 6);
          setEndIndex(endIndex - 6);
        }
      }
    }
  }

  return (
    <div className={gnatt_chart_1_tailwind.gnattChartWrapper + " vptb_gantt_chart"} key={updateChart} ref={timelineRef} onScroll={handleScroll}>
      <Timeline groups={vehilceGroupData ?? []} groupRenderer={renderGroup} items={timeLineItems} itemRenderer={handleItemRenderer} defaultTimeStart={startTime} defaultTimeEnd={endTime} sidebarWidth={200} sidebarContent="Group content" itemHeightRatio={0.75} lineHeight={45}>
        <TimelineHeaders style={{ justifyContent: "left" }}>
          <SidebarHeader>
            {({ getRootProps }) => {
              return (
                <div {...getRootProps()}>
                  <div className="grid grid-cols-2 gap-4 h-full text-center">
                    <div className="text-center">Line</div>
                    <div className="text-center">Stall</div>
                  </div>
                </div>
              );
            }}
          </SidebarHeader>
          <DateHeader unit="primaryHeader" style={{ display: "none" }}></DateHeader>
          <DateHeader unit="hour" style={{ justifyContent: "flex-start" }} className={gnatt_chart_1_tailwind.headerClass} labelFormat={"hh:mm A"} />
        </TimelineHeaders>
        <TimelineMarkers>
          <CustomMarker date={updated.valueOf()} >
            {({ styles, date }) => <div id="currentTimeMarker" style={{...styles, backgroundColor: 'red', zIndex: 100, bottom: 'unset', minHeight: '100%'}} />}
          </CustomMarker>
        </TimelineMarkers>
      </Timeline>
    </div>
  );
}
