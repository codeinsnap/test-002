import {TPlannedData, Tgroup, Tshift, TstallProdLine, TBreakTimes, TEntries} from './gnatt_chart_types'

const greenCode = { background: "green", borderColor: "black", color: "white"}
const blueCode = { background: "blue", borderColor: "black", color: "white"}
const redCode = { background: "red", borderColor: "black", color: "white"}

export const handleSorting = (list: Tgroup | TstallProdLine[]) => {
  if(list.length === 0) {
    return []
  }
  return list.sort((a,b) => {
    if(a.prod_line !== b.prod_line) {
        return a.prod_line.localeCompare(b.prod_line)
    } else {
        return parseInt(a.stall) - parseInt(b.stall)
    }
})
}

export const handleNewGroups = (groups: Tgroup) => {
  if (groups.length === 0) {return [];}
  const newList = [];
  for (let i = 0; i <= groups.length; i++) {
    if (groups[i]) {
      newList.push(groups[i]);
      if (i < groups.length) {
        newList.push({
          id: Math.floor(Math.random() * 10),
          title: ``,
          stall: ``,
          line: ``,
          prod_line: ``
        });
      }
    }
  }

  newList.forEach((element, index) => (element.id = index + 1));
  return newList;
};

const containsStallProdLine = (arr: TstallProdLine[], item: TstallProdLine) => {
    return arr.some(elem => elem.stall === item.stall && elem.prod_line === item.prod_line)
}

export const handleUniqueStallsAndProdLines = (plannedData: TEntries[] ) => {
    const uniqueStallsAndProdLines: TstallProdLine[] = [];
    plannedData.forEach(data => {
        const stallProdLine: TstallProdLine = {stall: data.stall, prod_line: data.prod_line};
        if(!containsStallProdLine(uniqueStallsAndProdLines, stallProdLine)) {
            uniqueStallsAndProdLines.push(stallProdLine);
        }
    })

    return handleSorting(uniqueStallsAndProdLines).map((item, index) => ({id: index + 1, stall: item.stall, prod_line: item.prod_line, title: ''})) ?? []
}

const handleDuplicate = (entry: TPlannedData, list: TPlannedData[]) => {

  const isValid = list.filter((item: TPlannedData) => item.actual_end_time === entry.actual_end_time && item.actual_start_time === entry.actual_start_time && item.serial_no === entry.serial_no )
  return isValid.length > 1 ? false : true

}

export const splitTimeSlotsByBreaks = (breakTimes: TBreakTimes[], plannedData: TPlannedData[], currentTime?: string) => {

  if (breakTimes.length === 0 || plannedData.length === 0) return plannedData

  const updatedTimeSlots: TPlannedData[] = [];
  plannedData.forEach(slot => {
    let isOverLapped = false
    breakTimes.forEach(breakTime => {

      if (slot?.actual_end_time && slot?.actual_start_time && currentTime) {

        const updatedSlot: {isValid: boolean, obj: TPlannedData | null} = handleTimeModifications(slot, currentTime)
        if (currentTime && updatedSlot.obj?.actual_end_time && updatedSlot.obj.actual_start_time && updatedSlot.isValid && updatedSlot.obj) {
          let style = {}
          if (updatedSlot.obj.actual_end_time < updatedSlot.obj.planned_end_time) style = greenCode
          if (updatedSlot.obj.actual_start_time > updatedSlot.obj.planned_end_time) style = redCode
          if (currentTime < updatedSlot?.obj?.actual_end_time) style = blueCode

          if (isOverlapping(updatedSlot.obj, breakTime)) {
            isOverLapped = true
            const prevtime = { actual_start: updatedSlot.obj.actual_start_time, actual_end: updatedSlot.obj.actual_end_time }
            const beforeBreak = { ...updatedSlot.obj, actual_start_time: updatedSlot.obj.actual_start_time, actual_end_time: breakTime.breakStart, prevtime }
            const afterBreak = { ...updatedSlot.obj, actual_start_time: breakTime.breakEnd, actual_end_time: updatedSlot.obj.actual_end_time, prevtime }
            if (isValidSlot(beforeBreak)) updatedTimeSlots.push({...beforeBreak, style});
            updatedTimeSlots.push({ ...updatedSlot.obj, serial_no: '', actual_start_time: breakTime.breakStart, actual_end_time: breakTime.breakEnd , planned_start_time: '', planned_end_time: ''})
            if (isValidSlot(afterBreak)) updatedTimeSlots.push({ ...afterBreak, isAfterBreak: true , style});
          } else {
            updatedTimeSlots.push({ ...updatedSlot.obj, serial_no: '', actual_start_time: breakTime.breakStart, actual_end_time: breakTime.breakEnd, planned_start_time: '', planned_end_time: '' })
          }
        }

      } else {
        if (isOverlapping(slot, breakTime)) {
          isOverLapped = true
          const prevtime = { start: slot.planned_start_time, end: slot.planned_end_time }
          const beforeBreak = { ...slot, planned_start_time: slot.planned_start_time, planned_end_time: breakTime.breakStart, prevtime }
          const afterBreak = { ...slot, planned_start_time: breakTime.breakEnd, planned_end_time: slot.planned_end_time, prevtime }
          if (isValidSlot(beforeBreak)) updatedTimeSlots.push(beforeBreak);
          updatedTimeSlots.push({ ...slot, serial_no: '', planned_start_time: breakTime.breakStart, planned_end_time: breakTime.breakEnd })
          if (isValidSlot(afterBreak)) updatedTimeSlots.push({ ...afterBreak, isAfterBreak: true });
        } else {
          updatedTimeSlots.push({ ...slot, serial_no: '', planned_start_time: breakTime.breakStart, planned_end_time: breakTime.breakEnd })
        }
      }
    })
    if (!isOverLapped) {
      const newSlot = handleTimeModifications(slot, currentTime || '')
      newSlot.obj && updatedTimeSlots.push(newSlot.obj)
    }
  })
  return updatedTimeSlots;
}

const isOverlapping = (slot: TPlannedData, breakTime: TBreakTimes) => {
  const slotStart = convertTimeToMinutes(slot?.actual_start_time || slot?.planned_start_time)
  const slotEnd = convertTimeToMinutes(slot?.actual_end_time || slot?.planned_end_time)
  const breakStart = convertTimeToMinutes(breakTime.breakStart)
  const breakEnd = convertTimeToMinutes(breakTime.breakEnd)
  return (slotStart < breakEnd && slotEnd > breakStart);
}


const convertTimeToMinutes = (time: string) => {
  if(!time) return 0
  const [hours, minutes] = time?.split(':')?.map(Number);
  return hours * 60 + minutes;
}

const isValidSlot = (slot: TPlannedData) => {
  const slotStart = convertTimeToMinutes(slot?.actual_start_time || slot.planned_start_time)
  const slotEnd = convertTimeToMinutes(slot?.actual_end_time || slot.planned_end_time)
  return (slotStart < slotEnd)
}

export const handleTimeModifications = (data: TPlannedData, currentTime: string) => {

  if(data.actual_start_time && data.actual_start_time > currentTime) {
    return {isValid: false, obj: null}
  }
  if (data.actual_end_time && data.actual_end_time > currentTime) {
    return {isValid: true, obj: {...data, actual_end_time: currentTime}}
  }
  return {isValid: true, obj: data}
}

export const entiresBeforeShiftTimings = (stall: TstallProdLine[], shiftTimings: Tshift, currentTime: string ) => {
 if (!stall || !shiftTimings) return []
 const entriesBeforeShift: TPlannedData[] = [];
const {start, end} = shiftTimings
   const emptyObj = {
     prod_line: '',
     stall: '',
     vin: '',
     serial_no: "",
     model_year: "",
     model_type: "",
     planned_start_time: '',
     planned_end_time: '',
     actual_start_time: '',
     actual_end_time: '',
     std_install_time: "",
     member_id: ""
 }

   stall?.forEach((entry, index: number) => {
     const beforeshift = handleTimeModifications({
       ...emptyObj,
       prod_line: entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
       stall: entry?.stall ? entry?.stall : stall[index - 1].stall,
       planned_start_time: entry?.prod_line ? "00:00:00" : '',
       planned_end_time: entry?.prod_line ? start : '',
       actual_start_time: entry?.prod_line ? '' : "00:00:00",
       actual_end_time: entry?.prod_line ? '': start,
     }, currentTime)

     const middleofShift = handleTimeModifications({
       ...emptyObj,
       prod_line: entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
       stall: entry?.stall ? entry?.stall : stall[index - 1].stall,
       planned_start_time: entry?.prod_line ? start : '',
       planned_end_time: entry?.prod_line ? end : '',
       actual_start_time: entry?.prod_line ? '' : start,
       actual_end_time: entry?.prod_line ? '': end,
       style: entry?.prod_line ? null :{
         background:"yellow",
         borderColor:"black",
         color:"yellow",
         zIndex:'10'
       }
     }, currentTime)

     const afterShift = handleTimeModifications({
       ...emptyObj,
       prod_line: entry?.prod_line ? entry?.prod_line : stall[index - 1].prod_line,
       stall: entry?.stall ? entry?.stall : stall[index - 1].stall,
       planned_start_time: entry?.prod_line ? end : '',
       planned_end_time: entry?.prod_line ? '23:59:59' : '',
       actual_start_time: entry?.prod_line ? '' : end,
       actual_end_time: entry?.prod_line ? '': '23:59:59',
     }, currentTime)

     beforeshift.isValid && entriesBeforeShift.push(beforeshift.obj as TPlannedData)
     middleofShift.isValid && entriesBeforeShift.push(middleofShift.obj as TPlannedData)
     afterShift.isValid && entriesBeforeShift.push(afterShift.obj as TPlannedData)

   })
  return entriesBeforeShift
}

