import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import Countdown from 'react-countdown';
import { ethers } from 'ethers';

// Components
import Navigation from './Navigation';
import Buy from './Buy';
import Progress from './Progress';
import Info from './Info';
import Loading from './Loading';
import WhitelistRequest from './WhitelistRequest';
import AdminDashboard from './AdminDashboard';

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
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [revealTime, setRevealTime] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState(null);

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    const { chainId } = await provider.getNetwork();

    const token = new ethers.Contract(config[chainId].token.address, TOKEN_ABI, provider);
    const crowdsale = new ethers.Contract(config[chainId].crowdsale.address, CROWDSALE_ABI, provider);
    setCrowdsale(crowdsale);

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    const balance = await token.balanceOf(account);
    setAccountBalance(ethers.utils.formatUnits(balance, 18));

    const allowMintingOn = await crowdsale.allowMintingOn();
    setRevealTime(allowMintingOn.toString() + "000");

    const owner = await crowdsale.owner();
    setOwnerAddress(owner);

    const price = await crowdsale.price();
    setPrice(ethers.utils.formatUnits(price, 18));

    const maxTokens = await crowdsale.maxTokens();
    setMaxTokens(ethers.utils.formatUnits(maxTokens, 18));

    const tokensSold = await crowdsale.tokensSold();
    setTokensSold(ethers.utils.formatUnits(tokensSold, 18));

    setIsLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (isLoading) {
        await loadBlockchainData();
      }

      if (crowdsale && account) {
        const whitelisted = await crowdsale.whitelist(account);
        setIsWhitelisted(whitelisted);
      }
    };

    loadData();
  }, [isLoading, crowdsale, account]);

  return (
    <Container fluid className='p-0 m-0'>
      <div className='d-flex justify-content-center align-items-center'>
        <Modal.Dialog className='w-100' style={{ maxWidth: '600px' }}>
          <Modal.Header closeButton>
            <Navigation />
          </Modal.Header>
          <Modal.Title>
            <h1 className='my-2 text-center'>
              <strong>Become a Founding Member of the EWare Ecosystem!</strong>
            </h1>
          </Modal.Title>
          <Modal.Body>
            <p className='my-2 text-center'>
              The EWare Token is the cornerstone of a powerful and expanding blockchain ecosystem.
              This is your opportunity to get in early on a community designed to fuel a wide range of decentralized applications and solutions built for the future.
              As the ecosystem grows, early investors will gain priority positioning in a network driven by innovation, utility, and long-term vision.
              Don’t just watch the future unfold—help shape it.
            </p>

            {isLoading ? (
              <Loading />
            ) : (
              <>
                <div className="text-center my-4 countdown-wrapper pulse">
                  <p className="mb-2"><strong>Get ready! Early access starts in:</strong></p>
                  <div className="d-flex justify-content-center">
                    <Countdown date={parseInt(revealTime)} className="h2 countdown-timer" />
                  </div>
                </div>
                <p className='my-4'><strong>Get Your Tokens:</strong> {price} ETH</p>
                <WhitelistRequest crowdsale={crowdsale} />
                <Buy provider={provider} price={price} crowdsale={crowdsale} setIsLoading={setIsLoading} />
                <Progress maxTokens={maxTokens} tokensSold={tokensSold} />

                {account === ownerAddress && (
                  <AdminDashboard provider={provider} account={account} crowdsale={crowdsale} />
                )}
              </>
            )}
          </Modal.Body>
          <hr />
          <div className='my-4'>
            <Modal.Footer>
              {account && <Info account={account} accountBalance={accountBalance} />}
            </Modal.Footer>
          </div>
        </Modal.Dialog>
      </div>
    </Container>
  );
}

export default App;
