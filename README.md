# Dataset Editor SV

## Overview
Dataset Editor SV is a powerful web-based tool designed to streamline and enhance the process of dataset visualization, editing, and quality assessment. This project is inspired by and built upon the template from [LeRobot's Dataset Visualizer](https://huggingface.co/spaces/lerobot/visualize_dataset), with significant improvements and additional features.

## Purpose
The primary goal of this project is to address the challenges in dataset management and quality control, particularly in the context of embodied AI and robotics. It provides a user-friendly interface for:

- Visualizing and exploring datasets
- Assessing and rating episode quality
- Managing and organizing dataset episodes
- Exporting high-quality episodes
- Adding detailed notes and annotations

## Key Features

### 1. Enhanced Visualization
- Multi-video synchronization
- Support for various video codecs (including AV1)
- Responsive design for different screen sizes
- Background video integration

### 2. Quality Assessment System
- Episode quality rating (good/bad)
- Detailed notes and annotations
- Quality metrics tracking
- Export functionality for high-quality episodes

### 3. User-Friendly Interface
- Intuitive navigation
- Sidebar for dataset information
- Episode pagination
- Real-time updates

### 4. Data Management
- Episode organization
- Quality tracking
- Export capabilities
- Dataset exploration

## Technical Implementation

### Frontend
- Built with Next.js and TypeScript
- React for component management
- Tailwind CSS for styling
- YouTube IFrame API integration

### Backend
- API endpoints for quality management
- Dataset handling
- Export functionality

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Modern web browser with AV1 codec support

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Data Sources
The project is designed to work with LeRobot datasets, which can be accessed through the Hugging Face platform. The data structure follows the LeRobot dataset format, which includes:

- Video recordings
- Episode metadata
- Quality assessments
- User annotations

## Credits
This project is based on the template from [LeRobot's Dataset Visualizer](https://huggingface.co/spaces/lerobot/visualize_dataset) and was developed as part of the Challenge 5: Datasets Tools Improvement track.

## Challenge Context
This project addresses the "Datasets Tools Improvement" challenge, focusing on:
- Making data collection more efficient and user-friendly
- Simplifying dataset modification and enhancement
- Supporting diverse data modalities
- Improving the overall dataset management experience

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[Add appropriate license information]

## Acknowledgments
- LeRobot team for the original template
- Hugging Face for hosting the original space
- The open-source community for various tools and libraries used in this project
