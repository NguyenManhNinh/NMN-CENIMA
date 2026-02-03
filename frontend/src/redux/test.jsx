function Timer() {
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(); // 1. Tạo kho chứa ID của interval

  useEffect(() => {
    // 2. Lưu ID vào ref (không dùng state để tránh render thừa)
    intervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      Timer: {timer}
      {/* 3. Dùng ref để clear interval từ một event handler khác */}
      <button onClick={() => clearInterval(intervalRef.current)}>
        Stop Timer
      </button>
    </div>
  );
}

