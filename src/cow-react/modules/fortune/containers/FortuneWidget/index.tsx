import styled from 'styled-components/macro'

const FortuneButton = styled.div`
  @keyframes glowing {
    from {
      box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f0f, 0 0 40px #0ff, 0 0 50px #e60073, 0 0 60px #e60073,
        0 0 70px #e60073;
    }
    to {
      box-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6,
        0 0 70px #ff4da6, 0 0 80px #ff4da6;
    }
  }

  display: inline-block;
  position: absolute;
  z-index: 500;
  left: 500px;
  top: 200px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  text-align: center;
  animation: glowing 1s ease-in-out infinite alternate;
  cursor: pointer;

  &:before {
    content: '🎉';
    font-size: 76px;
    position: relative;
    top: -27px;
    left: -7px;
  }
`

export function FortuneWidget() {
  return <FortuneButton></FortuneButton>
}
