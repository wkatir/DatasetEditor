# LeRobot Dataset Visualizer

A modern web application for visualizing and exploring robotics datasets. This tool helps researchers, developers, and students analyze robot training data through an intuitive and interactive interface.

## Features

- 🎥 Video playback and visualization of robot training episodes
- 📊 Interactive data visualization with Recharts
- 🔍 Dataset exploration and navigation
- 📱 Responsive design with modern UI
- 🚀 Fast performance with Next.js and Turbopack
- 🎯 TypeScript for type safety
- 🎨 Beautiful UI with TailwindCSS
- 🏷️ Dataset Quality Classification System

## Dataset Quality Classification

The application includes a robust system for classifying and managing dataset quality:

### Classification Features

- **Quality Rating**: Mark episodes as "Good" or "Bad"
- **Notes**: Add detailed notes to each classification
- **Metadata Tracking**: Automatically tracks:
  - Frame count
  - Duration
  - Error count
  - Success rate

### How to Use Classification

1. **View an Episode**:
   - Navigate to any episode in the dataset
   - Use the sidebar controls to play and analyze the episode

2. **Classify the Episode**:
   - Click "Good" or "Bad" to classify the episode
   - Add notes using the "Add Notes" button
   - Notes can include observations, issues, or any relevant information

3. **Export Good Episodes**:
   - Click "Export Good" to download a JSON file containing:
     - List of all good episodes
     - Episode metadata
     - Quality information
     - Success rates and error counts

### Data Storage

Classifications are stored in JSON format at:
```
data/qualities/${organization}_${dataset}.json
```

The JSON structure includes:
```json
{
  "metadata": {
    "total_episodes": number,
    "good_episodes": number,
    "bad_episodes": number,
    "unrated_episodes": number,
    "last_updated": timestamp
  },
  "episodeId": {
    "quality": "good" | "bad" | "unrated",
    "notes": string,
    "timestamp": number,
    "metadata": {
      "frame_count": number,
      "duration": number,
      "error_count": number,
      "success_rate": number
    }
  }
}
```

### Filtering Episodes

You can filter episodes by quality:
- Use the URL parameter `?quality=good` to view only good episodes
- Use `?quality=bad` to view only bad episodes
- Use `?quality=unrated` to view unrated episodes

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dataset-editor-sv.git
cd dataset-editor-sv
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a dataset ID in the search bar (e.g., `lerobot/aloha_static_cups_open`)
2. Explore the dataset through the interactive interface
3. Navigate between episodes and analyze robot behavior
4. Use the visualization tools to understand training data

### Example Datasets

- `lerobot/aloha_static_cups_open`
- `lerobot/columbia_cairlab_pusht_real`
- `lerobot/taco_play`

## Tech Stack

- **Framework**: Next.js 15.3.1
- **Language**: TypeScript
- **UI Library**: React 19.0.0
- **Styling**: TailwindCSS
- **Data Visualization**: Recharts
- **Data Processing**: Hyparquet
- **Icons**: React Icons

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
├── context/         # React context providers
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [LeRobot](https://x.com/RemiCadene/status/1825455895561859185) for the original concept
- Hugging Face for dataset hosting
- The open-source community for the amazing tools and libraries

## Contact

For questions and support, please open an issue in the GitHub repository.
