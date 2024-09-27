import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import nepalGeoJson from "../../data/nepal-districts.json"; // Ensure valid GeoJSON

const MapOne: React.FC = () => {
  const [position, setPosition] = useState({ coordinates: [83.9416, 28.3949], zoom: 2 });

  const handleZoomIn = () => {
    if (position.zoom >= 4) return; // Limit max zoom level
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };

  const handleZoomOut = () => {
    if (position.zoom <= 1) return; // Limit min zoom level
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  const handleMoveEnd = (newPosition: any) => {
    setPosition(newPosition);
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-7">
      <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
        Nepal Districts
      </h4>
      <div className="relative h-[500px] w-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [83.9416, 28.3949], // Center coordinates for Nepal
            scale: 2500, // Adjust scale
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={nepalGeoJson}>
              {({ geographies }: { geographies: any[] }) => // Provide type for geographies
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: {
                        fill: "#C8D0D8",
                        outline: "none",
                      },
                      hover: {
                        fill: "#3056D3",
                        outline: "none",
                      },
                      pressed: {
                        fill: "#FF5722",
                        outline: "none",
                      },
                    }}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Zoom in/out buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2 z-10">
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 bg-gray-300 rounded dark:bg-gray-700"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 bg-gray-300 rounded dark:bg-gray-700"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapOne;
