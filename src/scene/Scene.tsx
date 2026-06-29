import { useView } from '../state/useView'
import { Lighting } from './Lighting'
import { Shell } from './Shell'
import { Rooms } from './Rooms'
import { Roof } from './Roof'
import { Truck } from './Truck'
import { FlowMarkers, ZoneLabels } from './FlowMarkers'
import { Racks } from './Racks'
import { People } from './People'
import { Fridges } from './Fridges'
import { TruckBay } from './TruckBay'
import { Dimensions } from './Dimensions'
import { MeasureTool } from './MeasureTool'
import { Post } from './Post'
import { OrbitView } from '../controls/OrbitView'
import { FPControls } from '../controls/FPControls'

export function Scene() {
  // selectores individuales → re-render solo cuando cambia ese valor
  const mode = useView((s) => s.mode)
  const showRoof = useView((s) => s.showRoof)
  const showTruck = useView((s) => s.showTruck)
  const showFlow = useView((s) => s.showFlow)
  const showLabels = useView((s) => s.showLabels)
  const showRacks = useView((s) => s.showRacks)
  const showDims = useView((s) => s.showDims)

  return (
    <>
      <Lighting />
      <Shell />
      <Rooms />
      {showRoof && <Roof />}
      {showTruck && <Truck />}
      {showFlow && <FlowMarkers />}
      {showFlow && <TruckBay />}
      {showLabels && <ZoneLabels />}
      {showRacks && <Racks />}
      {showRacks && <People />}
      {showRacks && <Fridges />}
      {showDims && <Dimensions />}
      <MeasureTool />

      {mode === 'ext' ? <OrbitView /> : <FPControls />}
      <Post />
    </>
  )
}
