import './OwnLayout.css';
import {useEffect, useState} from "react";

const OwnLayout = (Title, imgTwitter, imgDiscord, image, solAmount, main, supply) => {
    const [opacity, setOpacity] = useState(0)
    const [offset, setOffset] = useState(0)

    setTimeout(() => {
        setOpacity(100)
    }, 0)

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }


    useEffect(() => {
        if (Number(offset) <= 230) {
            const timer = setTimeout(() => {
                const random = getRandomArbitrary(2, 6)
                const randomToFixed = Number(random.toFixed())
                // console.log(Number(offset), Number(randomToFixed))
                setOffset(Number(offset) + randomToFixed)
            }, 4000)
            return () => clearTimeout(timer);
        }
    }, [offset])

    return (
        <div className={'AppContainer'}
             ref={(el) => {
                 if (el) {
                     el.style.setProperty('opacity', opacity, 'important');
                 }
             }}
        >
            <header>
                <div>
                    <a href={'/'}>{Title}</a>
                </div>
                <nav>
                    <ul>
                        <li>
                            <img src={imgTwitter} alt=""/>
                        </li>
                        <li>
                            <img src={imgDiscord} alt=""/>
                        </li>
                    </ul>
                </nav>
            </header>
            <div className="App">
                <div>
                    <img src={image}
                         alt={'projectImage'}/>
                </div>
                <div>
                    <div>Amount - {solAmount}</div>
                    <button onClick={main}>connect</button>
                    <div className={'lineContainer'}>
                        <div className={'line'}></div>
                        <div className={'circleOnLine'} style={{left: `${offset}px`}}></div>
                    </div>
                    <div>{`${(offset * (supply/235)).toFixed()} / ${supply}`}</div>
                </div>
            </div>
        </div>
    );
}

export default OwnLayout