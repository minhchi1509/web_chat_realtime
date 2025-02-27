import { useEffect, useState } from 'react';

const useElementHeight = (elementId: string) => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return; // Nếu phần tử không tồn tại, thoát khỏi hook

    // Hàm cập nhật chiều cao
    const updateHeight = () => {
      const newHeight = element.getBoundingClientRect().height;
      setHeight(newHeight);
    };

    // Tạo một ResizeObserver để theo dõi sự thay đổi kích thước của phần tử
    const resizeObserver = new ResizeObserver(updateHeight);

    // Bắt đầu theo dõi phần tử
    resizeObserver.observe(element);

    // Gọi ngay lần đầu để cập nhật chiều cao ban đầu
    updateHeight();

    // Dọn dẹp khi component unmount hoặc khi elementId thay đổi
    return () => {
      resizeObserver.unobserve(element); // Ngừng theo dõi phần tử
      resizeObserver.disconnect(); // Ngắt kết nối ResizeObserver
    };
  }, [elementId]); // Chạy lại khi elementId thay đổi

  return Math.round(height); // Làm tròn chiều cao để tránh giá trị thập phân không cần thiết
};

export default useElementHeight;
