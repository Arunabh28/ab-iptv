import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import "./App.css";

const App = () => {
  const [groups, setGroups] = useState([]);
  const [channels, setChannels] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [videoError, setVideoError] = useState(false);

  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    setVideoError(false); // Reset video error on channel selection
  };

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/playlist.m3u") // Load M3U file
      .then((res) => res.text())
      .then(parseM3U);
  }, []);

  const parseM3U = (data) => {
    const lines = data.split("\n");
    let tempGroups = {};
    let currentGroup = "General";
    lines.forEach((line) => {
      if (line.startsWith("#EXTINF")) {
        const nameMatch = line.match(/,(.*)/);
        const groupMatch = line.match(/group-title="(.*?)"/);
        if (groupMatch) currentGroup = groupMatch[1];
        if (!tempGroups[currentGroup]) tempGroups[currentGroup] = [];
        tempGroups[currentGroup].push({ name: nameMatch[1], url: null });
      } else if (line.startsWith("http")) {
        tempGroups[currentGroup][tempGroups[currentGroup].length - 1].url = line.trim();
      }
    });
    setGroups(Object.keys(tempGroups));
    setChannels(tempGroups);
  };

  return (
    <div className="app-container">
      {!selectedGroup ? (
        <div className="group-container">
          {groups.map((group) => (
            <button key={group} onClick={() => setSelectedGroup(group)} className="group-button tile-button">
              {group}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedGroup(null)} className="back-button">Back</button>
          <div className="channel-container">
            {channels[selectedGroup].map((channel) => (
              <button key={channel.name} onClick={() => handleChannelClick(channel)} className="channel-button">
                {channel.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedChannel && (
        <div className="player-overlay">
          <button onClick={() => setSelectedChannel(null)} className="close-button">Close</button>
          {videoError ? (
            <p className="error-message">Error: Unable to load video. Please try another channel.</p>
          ) : (
            <ReactPlayer 
              url={selectedChannel.url} 
              controls 
              width="100%" 
              height="100%" 
              playing 
              onError={() => setVideoError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default App;
