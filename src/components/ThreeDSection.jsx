import { ScaleUp } from "./AnimatedContainer";
import { RotatingCube, FloatingSphere, RotatingPyramid, AnimatedTorus, RainbowIcosahedron, NestedCubes } from "./ThreeDModels";

export function ThreeDSection({ title, description, modelComponent: ModelComponent, reverse = false }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900/50 via-gray-900 to-slate-900/50 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto ${reverse ? 'lg:grid-cols-2' : ''}`}>
        {/* Text Content */}
        <ScaleUp delay={0}>
          <div className={reverse ? 'lg:order-last' : ''}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {title}
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-8">
              {description}
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all hover:scale-105">
                Learn More
              </button>
              <button className="px-8 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all hover:scale-105">
                Explore
              </button>
            </div>
          </div>
        </ScaleUp>

        {/* 3D Model Canvas */}
        <ScaleUp delay={0.2}>
          <div className="relative h-96 sm:h-[500px] rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-lg hover:border-white/20 transition-all shadow-2xl">
            <ModelComponent />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-2xl"></div>
          </div>
        </ScaleUp>
      </div>
    </div>
  );
}

export function ThreeDGallery() {
  const models = [
    { title: "Rotating Cube", component: RotatingCube, color: "from-indigo-500 to-purple-500" },
    { title: "Floating Sphere", component: FloatingSphere, color: "from-purple-500 to-pink-500" },
    { title: "Pyramid", component: RotatingPyramid, color: "from-yellow-500 to-orange-500" },
    { title: "Torus Knot", component: AnimatedTorus, color: "from-cyan-500 to-blue-500" },
    { title: "Rainbow Icosahedron", component: RainbowIcosahedron, color: "from-green-500 to-cyan-500" },
    { title: "Nested Cubes", component: NestedCubes, color: "from-blue-500 to-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            3D Model Gallery
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Interactive 3D models powered by Three.js. Hover, rotate, and explore!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {models.map((model, idx) => (
            <ScaleUp key={idx} delay={idx * 0.1}>
              <div className="group relative h-80 rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-lg hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20">
                <model.component />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                  <h3 className={`text-xl font-bold bg-gradient-to-r ${model.color} bg-clip-text text-transparent`}>
                    {model.title}
                  </h3>
                </div>
              </div>
            </ScaleUp>
          ))}
        </div>
      </div>
    </div>
  );
}
