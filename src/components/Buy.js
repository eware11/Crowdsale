import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

const Buy = ({ provider, price, crowdsale, setIsLoading }) => {
    const [amount, setAmount] = useState('0')
    const [isWaiting, setIsWaiting] = useState(false)
    const [address, setAddress] = useState("")

    const buyHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
            const signer = await provider.getSigner()

            // We need to calculate the required ETH in order to buy the tokens...
            const value = ethers.utils.parseUnits((amount * price).toString(), 'ether')
            const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')

            const transaction = await crowdsale.connect(signer).buyTokens(formattedAmount, { value: value })
            await transaction.wait()
        } catch {
            window.alert('User rejected or transaction reverted')
        }

        setIsLoading(true)
    }

    const addToWhitelistHandler = async (e) => {
        e.preventDefault()
        setIsWaiting(true)

        try {
            const signer = await provider.getSigner()

            // We need to calculate the required ETH in order to buy the tokens...

            const transaction = await crowdsale.connect(signer).addToWhitelist(address)
            await transaction.wait()
        } catch (error) {
            window.alert('User rejected or transaction reverted')
            console.error(error)
        }

        setIsLoading(true)
    }

    return (
        <>
        <Form onSubmit={buyHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
            <Form.Group as={Row}>
                <Col>
                    <Form.Control type="number" placeholder="Enter amount" onChange={(e) => setAmount(e.target.value)} />
                </Col>
                <Col className='text-center'>
                    {isWaiting ? (
                        <Spinner animation="border" />
                    ) : (
                        <Button variant="primary" type="submit" style={{ width: '100%' }}>
                            Buy Tokens
                        </Button>
                    )}
                </Col>
            </Form.Group>
        </Form>

<Form onSubmit={addToWhitelistHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
<Form.Group as={Row}>
    <Col>
        <Form.Control type="text" placeholder="Enter address" onChange={(e) => setAddress(e.target.value)} />
    </Col>
    <Col className='text-center'>
        {isWaiting ? (
            <Spinner animation="border" />
        ) : (
            <Button variant="primary" type="submit" style={{ width: '100%' }}>
                Add to Whitelist
            </Button>
        )}
    </Col>
</Form.Group>
</Form>
</>
    );
}

export default Buy;