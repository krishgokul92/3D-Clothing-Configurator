import Canvas from './canvas';
import Navbar from './components/Navbar';
import Customizer from './pages/Customizer';

function App() {
  return (
    <main className="app transition-all ease-in">
      <Navbar />
      <Canvas />
      <Customizer />
    </main>
  )
}

export default App
