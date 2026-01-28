const FirstAidVideos = () => {
  const videos = [
    { id: "BwI0QGAPXmQ", title: "How to perform CPR", category: "Cardiac" },
    { id: "spbjMytw_L0", title: "Heimlich Maneuver (Choking)", category: "Airway" },
    { id: "JvYyO113lqY", title: "Managing Severe Bleeding", category: "Trauma" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Emergency First-Aid</h1>
      <p className="text-gray-600 mb-8">Quick tutorials for life-saving techniques before the ambulance arrives.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map(vid => (
          <div key={vid.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition hover:shadow-2xl">
            <iframe 
              className="w-full h-56" 
              src={`https://www.youtube.com/embed/${vid.id}`} 
              title={vid.title}
              allowFullScreen
            ></iframe>
            <div className="p-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">{vid.category}</span>
              <h3 className="mt-2 font-bold text-lg text-gray-800">{vid.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FirstAidVideos;