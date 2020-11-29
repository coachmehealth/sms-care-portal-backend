import React from 'react';
import styled from 'styled-components';
import Table, { Column, SortOption, TableOptions } from "../components/Table";
// import ImageGallery from 'react-image-gallery';

const DashboardContainer = styled.div`
    margin-left: 106px;
`

const TwoColumn: React.FC = () => {
    return (
    <DashboardContainer>
    <div className="columns">
        <div className="column">
            <Title>Bokuto Kotaro's Patient Records</Title>
            <ExportButton>Export to CSV</ExportButton>
            {/* Carousel very broken commenting it out.
            <ImageGallery items={images} showThumbnails={false} showFullscreenButton={false} useBrowserFullscreen={false} disableSwipe={true}></ImageGallery>
            */}
            <Table options={table1Options} title="" data={testData} columns={cols1}></Table>

        </div>
        <div className="column">
            Second column
        </div>
    </div>
    </DashboardContainer>
    )
}

const table1Options: TableOptions = {
    sortOptions: [],
    sortsChoiceEnabled: false
}

const table2Options: TableOptions = {
    sortOptions: [],
    sortsChoiceEnabled: false
}

const testData = new Array(5).fill(undefined).map((_, i) => ({
    indicator: "Blood Glucose Levels",
    measure: Math.ceil(Math.random() * 1000),
    // create logic for analysis later here I guess?
    analysis: "placeholder",
    timeRecorded: "11:20AM 2020-10-30"
}));

const cols1: Column[] = [
    {
        name: "Indicator",
        data: "indicator",
        key: "indicator"
    },
    {
        name: "Measure",
        data: "measure",
        key: "measure"
    },
    {
        // need to create logic for the text color, possible do it down in activetext
        name: "Analysis",
        data: (row) => <ActiveText>Green</ActiveText>,
        key: "analysis"
    },
    {
        name: "Time Recorded",
        data: "timeRecorded",
        key: "timeRecorded"
    }
]

const images = [
    {
      original: 'https://picsum.photos/id/1018/1000/600/',
      thumbnail: 'https://picsum.photos/id/1018/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1015/1000/600/',
      thumbnail: 'https://picsum.photos/id/1015/250/150/',
    },
    {
      original: 'https://picsum.photos/id/1019/1000/600/',
      thumbnail: 'https://picsum.photos/id/1019/250/150/',
    },
  ];

const ExportButton = styled.button`
    width: 112px !important; 
    height: 42px !important;
    background-color: #F29DA4 !important;
    font-size: 13px !important;
    border-radius: 15px !important;
    color: white !important;
    border: none !important;
    font-weight: 600;

    &:hover {
        box-shadow: 5px 5px 10px rgba(221, 225, 231, 1) !important;
        border: none !important;
    }

    &:focus {
        box-shadow: 5px 5px 10px rgba(221, 225, 231, 1) !important;
        border: none !important;
    }
    position: absolute;
    left: 43.82%;
    right: 48.4%;
    top: 23.63%;
    bottom: 72.27%;
`;

const ActiveText = styled.p`
    color: #B4D983;
    font-weight: 800;
`

export default TwoColumn;