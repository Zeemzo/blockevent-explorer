import React, { Component } from 'react';
import {
  Badge, TabContent, TabPane, Nav, NavItem, NavLink, Card, CardTitle, CardText,
  Container, Row, Col, Button, Form, FormGroup, Label, Input, FormText, Spinner
} from 'reactstrap';
import classnames from 'classnames';
import './App.css';
import { AES, enc } from "crypto-js";
import StellarSdk from "stellar-sdk";
import ReactNotification, { store } from 'react-notifications-component'
import * as FuzzySearch from 'fuzzy-search';
import { Howl, Howler } from 'howler';


// const Asset = StellarSdk.Asset
StellarSdk.Network.useTestNetwork();
function encrypt(myString) {

  // PROCESS
  const encryptedWord = enc.Utf8.parse(myString); // encryptedWord Array object
  const encrypted = enc.Base64.stringify(encryptedWord); // string: 'NzUzMjI1NDE='
  return encrypted;
}
class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      ledger: [],
      distributorLedger: [],
      secretKey: '',
      activeTab: '1',
      viewResult: false,
      showSpinners: false,
      showSearch: false,
      result: [],
      distributorPublicKey: "GCMLRH3SZT4R7DYYXW2ILWJFNC3O6W6EYZUH2KRAAW3T4LIGJORYD2HS",
      poolPublicKey: "GDFZCD37V7YBWQWDNRA5UUQ2FJ2OHY5OBO7TUSZWD3PPQGANHRCM5DNI",

    }
    this.toggle = this.toggle.bind(this)
    this.txHandler = this.txHandler.bind(this)
    this.search = this.search.bind(this)
    this.accountHandler = this.accountHandler.bind(this)
    this.initialTxHandler = this.initialTxHandler.bind(this)
    this.initialAccountHandler = this.initialAccountHandler.bind(this)


  }

  SoundPlay() {
    const Sounds = new Howl({
      src: ["/eventually.mp3"]
      // src: ["/quite-impressed.mp3"]

    });
    Sounds.play();
    console.log("sound");
  }

  SoundPlay2() {
    const Sounds = new Howl({
      // src: ["/eventually.mp3"]
      src: ["/quite-impressed.mp3"]

    });
    Sounds.play();
    console.log("sound");
  }
  txHandler = async function (txResponse) {
    if (txResponse.type == "payment" && txResponse.asset_code == "CBM2") {
      this.SoundPlay()
      store.addNotification({
        title: "New Participant!",
        message: txResponse.source_account + ' Just Entered!',
        type: "default",
        insert: "bottom",
        container: "bottom-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true,
          pauseOnHover: true
        }
      });
    }
  };

  initialTxHandler = async function (txResponse) {

    if (this.state.ledger == null) {
      this.setState({ ledger: [] })
    }

    var arr = this.state.ledger.reverse()
    // if(txResponse.)
    if (txResponse.type == "payment" && txResponse.asset_code == "CBM2") {
      arr.push(txResponse);
    }
    this.setState({ ledger: arr.reverse() })
    this.setState({ showSpinners: false });



    // console.log(txResponse)
  };

  accountHandler = function (txResponse) {
    if (txResponse.type == "payment" && txResponse.asset_code == "CBM2"
      && txResponse.from == this.state.distributorPublicKey) {
      this.SoundPlay2()
      store.addNotification({
        title: "Ticket Aquired!",
        message: txResponse.source_account + ' Just reserved a seat!',
        type: "info",
        insert: "bottom",
        container: "bottom-right",
        animationIn: ["animated", "fadeIn"],
        animationOut: ["animated", "fadeOut"],
        dismiss: {
          duration: 3000,
          onScreen: true,
          pauseOnHover: true
        }
      });


    }

  }

  initialAccountHandler = function (txResponse) {
    if (this.state.distributorLedger == null) {
      this.setState({ distributorLedger: [] })
    }
    var arr = this.state.distributorLedger.reverse()
    if (txResponse.type == "payment" && txResponse.asset_code == "CBM2"
      && txResponse.from == this.state.distributorPublicKey) {
      arr.push(txResponse);
    }
    this.setState({ distributorLedger: arr.reverse() })
    this.setState({ showSpinners: false });

  }
  componentDidMount() {

    var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    var lastCursor = 0; // or load where you left off

    server.payments()
      .forAccount(this.state.distributorPublicKey)
      .cursor(lastCursor)
      .stream({
        onmessage: this.initialAccountHandler
      })
      
    server.payments()
      .forAccount(this.state.distributorPublicKey)
      .cursor('now')
      .stream({
        onmessage: this.accountHandler
      })




    server.payments()
      .forAccount(this.state.poolPublicKey)
      .cursor(lastCursor)
      .stream({
        onmessage: this.initialTxHandler
      })

    server.payments()
      .forAccount(this.state.poolPublicKey)
      .cursor('now')
      .stream({
        onmessage: this.txHandler
      })







  }


  toggle(tab) {
    if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
  }

  async search(key) {
    if (key != "") {
      this.setState({ showSearch: true });
    }

    const searcher = new FuzzySearch(this.state.ledger,
      ['source_account'], {
      caseSensitive: false,
    });
    this.setState({ result: searcher.search(key) });


  }

  render() {
    return (
      <div>
        <img style={{ margin: ' 0 40% 0 40%', position: "fixed", zIndex: '-1' }} width="20%" src="blockevent.png" />
        {/* <h1 style={{ margin: ' 15% 0 0 45%', position: "fixed", zIndex: '-1', 'text-shadow': '-2px 0 black, 0 2px black, 2px 0 black, 0 -2px black' }}><Badge color="primary">Explorer</Badge></h1> */}

        <Container style={{ padding: '20% 0 0 0' }} >

          <h1 ><Badge color="primary">Explorer</Badge></h1>
          <h2 style={{ color: 'white', 'text-shadow': '-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue' }}>Live Ticket Assets in Stellar:  </h2>
          <h3 style={{ color: 'white', 'text-shadow': '-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue' }}>Acquired: <Badge color="secondary">{this.state.distributorLedger.length}</Badge></h3>
          <h3 style={{ color: 'white', 'text-shadow': '-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue' }}> Verified: <Badge color="secondary">{this.state.ledger.length}</Badge></h3>

          <Form >
            <FormGroup row>
              <Label for="searchKey" sm={1}><h4 style={{ color: 'white', 'text-shadow': '-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue' }}>Search</h4></Label>
              <Col sm={6}>
                <Input style={{ color: 'blue','box-shadow': '-2px 0 blue, 0 2px blue, 2px 0 blue, 0 -2px blue' }}type="text" name="searchKey" id="searchKey"
                  placeholder="Search By Public Key" onChange={(e) => {
                    this.search(e.target.value);
                  }} />
              </Col>
            </FormGroup>
          </Form>

          <br />
          <Row >
            {!this.state.showSearch ?

              this.state.ledger.map((res, i) => {
                return (
                  <Col sm="12" key={i + 1}>

                    <a href={"https://www.stellar.org/laboratory/#explorer?resource=operations&endpoint=for_transaction&values="
                      + encrypt(JSON.stringify({ transaction: res.transaction_hash })) + "&network=test"} target="_blank">
                      <div className='ticket'>
                        <div className='ticket-edge-top-left'></div>
                        <div className='ticket-edge-top-right'></div>
                        <div className='ticket-edge-bottom-left'></div>
                        <div className='ticket-edge-bottom-right'></div>
                        <div className='ticket-punches'></div>
                        {/* <div className='ticket-punches-right'></div> */}
                        <div className='ticket-inner'>
                          <div className='ticket-headline'>
                            Hash: {res.transaction_hash.substring(0, 36) + " . . ."}
                          </div>
                          <div className='ticket-star'>
                            <div className='fa fa-star-o'></div>
                          </div>
                          <div className='ticket-admit'>Account: {res.source_account.substring(0, 36) + " . . ."}</div>
                          <div className='ticket-star'>
                            <div className='fa fa-star-o'></div>
                          </div>
                          <div className='ticket-admit'>Timestamp: {res.created_at}</div>

                          <div className='ticket-admit'>
                            <div className='ticket-numbers'>{res.asset_code}</div>
                            <div className='ticket-numbers second'><p>{res.asset_code}</p><p>{res.transaction_hash.substring(0, 7) + " . . ."}</p></div>
                          </div>
                        </div>
                      </div>
                    </a>


                    {/* <Card body>


                          <CardText>Source Account: {res.source_account}</CardText>
                          <CardText>Transaction Hash: {res.transaction_hash}</CardText>
                          <CardText>Asset Code: {res.asset_code}  {"         |         "} Timestamp: {res.created_at}</CardText>
                          <CardText></CardText>

                          <a href={"https://www.stellar.org/laboratory/#explorer?resource=operations&endpoint=for_transaction&values="
                            + encrypt(JSON.stringify({ transaction: res.transaction_hash })) + "&network=test"} target="_blank">
                            <Button>View In Stellar</Button>
                          </a>
                        </Card> */}
                  </Col>
                )

              }) :
              this.state.result.map((res, i) => {
                return (
                  <Col sm="12" key={i + 1}>
                    <a href={"https://www.stellar.org/laboratory/#explorer?resource=operations&endpoint=for_transaction&values="
                      + encrypt(JSON.stringify({ transaction: res.transaction_hash })) + "&network=test"} target="_blank">
                      <div className='ticket'>
                        <div className='ticket-edge-top-left'></div>
                        <div className='ticket-edge-top-right'></div>
                        <div className='ticket-edge-bottom-left'></div>
                        <div className='ticket-edge-bottom-right'></div>
                        <div className='ticket-punches'></div>
                        {/* <div className='ticket-punches-right'></div> */}
                        <div className='ticket-inner'>
                          <div className='ticket-headline'>
                            Hash: {res.transaction_hash}
                          </div>
                          <div className='ticket-star'>
                            <div className='fa fa-star-o'></div>
                          </div>
                          <div className='ticket-admit'>Account: {res.source_account}</div>
                          <div className='ticket-star'>
                            <div className='fa fa-star-o'></div>
                          </div>
                          <div className='ticket-admit'>Timestamp: {res.created_at}</div>

                          <div className='ticket-admit'>
                            <div className='ticket-numbers'>{res.asset_code}</div>
                            <div className='ticket-numbers second'>{res.asset_code}</div>
                          </div>
                        </div>
                      </div>
                    </a>
                    {/* <Card body>

                          <CardText>Source Account: {res.source_account}</CardText>
                          <CardText>Transaction Hash: {res.transaction_hash}</CardText>
                          <CardText>Asset Code: {res.asset_code}  {"         |         "} Timestamp: {res.created_at}</CardText>
                          <CardText></CardText>

                          <a href={"https://www.stellar.org/laboratory/#explorer?resource=operations&endpoint=for_transaction&values="
                            + encrypt(JSON.stringify({ transaction: res.transaction_hash })) + "&network=test"} target="_blank">
                            <Button>View In Stellar</Button>
                          </a>
                        </Card> */}
                  </Col>
                )

              })}
            {/* {this.state.ledger ? : null} */}


          </Row>

        </Container>

        <ReactNotification />


      </div>
    );
  }

}


export default App;
