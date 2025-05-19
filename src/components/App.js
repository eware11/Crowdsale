import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { ethers } from 'ethers';
import Countdown from 'react-countdown';

// Components
import Navigation from './Navigation';
import Buy from './Buy';
import Progress from './Progress';
import Info from './Info';
import Loading from './Loading';

// Artifacts
import CROWDSALE_ABI from '../abis/Crowdsale.json';
import TOKEN_ABI from '../abis/Token.json';

// Config
import config from '../config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [crowdsale, setCrowdsale] = useState(null);

  const [account, setAccount] = useState(null);
  const [accountBalance, setAccountBalance] = useState(0);

  const [price, setPrice] = useState(0);
  const [maxTokens, setMaxTokens] = useState(0);
  const [tokensSold, setTokensSold] = useState(0);

  const [openDate, setOpenDate] = useState(null); // 👈 From contract
  const [isLoading, setIsLoading] = useState(true);

  const loadBlockchainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      const { chainId } = await provider.getNetwork();

      const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
      const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
      setCrowdsale(crowdsale);

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);

      const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18);
      setAccountBalance(accountBalance);

      const price = ethers.utils.formatUnits(await crowdsale.price(), 18);
      setPrice(price);

      const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18);
      setMaxTokens(maxTokens);

      const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18);
      setTokensSold(tokensSold);

      const openDate = await crowdsale.openDate();
      setOpenDate(openDate.toNumber() * 1000); // convert to ms for Countdown

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      alert(`Blockchain loading error: ${error.message || JSON.stringify(error)}`);
    }
  };

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData();
    }
  }, [isLoading]);

  return (
    <Container>
      <Navigation />

      <h1 className='my-4 text-center'>Introducing the EWARE Token!</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {Date.now() < openDate ? (
            <div className="text-center">
              <h4>Token sale starts in:</h4>
              <Countdown date={openDate} />
            </div>
          ) : (
            <>
              <p className='text-center'><strong>Current Price:</strong> {price} ETH</p>
              <Buy
                provider={provider}
                price={price}
                crowdsale={crowdsale}
                setIsLoading={setIsLoading}
              />
              <Progress maxTokens={maxTokens} tokensSold={tokensSold} />
            </>
          )}
        </>
      )}

      <hr />

      {account && (
        <Info account={account} accountBalance={accountBalance} />
      )}
    </Container>
  );
}

export default App;
