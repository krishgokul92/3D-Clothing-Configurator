import Canvas from './canvas';
import Navbar from './components/Navbar';
import Customizer from './pages/Customizer';

function App() {
  return (
    <main className="app transition-all ease-in">
      <Navbar />
      <div className="app-content">
        <Canvas />
        <Customizer />
      </div>
    </main>
  )
}

export default App
