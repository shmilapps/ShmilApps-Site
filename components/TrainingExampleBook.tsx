'use client';
import DigitalBook from './DigitalBook';
export default function TrainingExampleBook({language}:{language:'he'|'en'}){return <DigitalBook language={language} src={'/portfolio/training/crypto-book/index.html?lang='+language} messageType="shmilapps-training-book-height" title="קריפטו וביטקוין | Crypto and Bitcoin"/>;}
