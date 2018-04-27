import React from 'react'
import { connect } from 'react-redux'
import SiteLayout from './Layout'

import { Breadcrumb, Radio, Checkbox, Tag, Notification, Message  } from 'element-react'

import 'element-theme-default'
import { isArray } from 'util'
var crypto = require('crypto')
class OrderSecondStep extends React.Component{
  constructor (props) {
    super(props)
    this.initialState = {
      totalPrice: 0,
      tempProduct: this.props.cartItem.tempProduct,
      allconfig: [],
      quantity: 1
  }
    this.state = Object.assign({},this.initialState);
    // this.baseState = this.state 
  }
  
  async componentDidMount () {
    console.log('second step', this.props)
    console.log('active product', this.state.tempProduct)
    document.title = "Product details"
    this.initialProductDetails()
  }
  componentWillReceiveProps () {
    this.initialProductDetails()
  }
  async initialProductDetails () {
    let pro = this.props.cartItem.tempProduct
    let adonsData = []
    await pro.ProductDetails.map(async(data)=>{
      await this.setState({[data.ConfigurationName]: data.Default || ''})
      
      for (var key in data.Configurables) { // loop the json object
        if (data.Configurables.hasOwnProperty(key)) {
            adonsData.push({adons:data.Configurables[key], id: key})
        }
      }
      
    })
    await this.setState({allconfig: adonsData, totalPrice: this.state.tempProduct.Price})
    this.priceCalculation()
  }

  productNext (key) { // here key is the product index
    let product = this.state.products[key]
    this.props.cart(product)
  }
  async onChange(key, value) {
    await this.setState({
      [key]: value
    })
    this.priceCalculation()
  }
  async addToCartResetPage (type) { // type indicates whose screen to load after adding cart
    var obj=this.state
    let sum = ''
    for( var el in obj ) {
      if( obj.hasOwnProperty( el ) ) {
        sum += obj[el]
      }
    }
    let cryptoFingerPrint = await crypto.createHash('md5').update(sum).digest("hex");
    let fingerPrint = {fingerPrint: cryptoFingerPrint}
    let matchedInCart = await this.props.cartItem.cartItems.find(d => {
      return d.fingerPrint === cryptoFingerPrint
    })
    if (!matchedInCart) {
      let postObj = Object.assign(fingerPrint, this.state)
      await this.props.cart(postObj)
    } else {
      await this.props.updateQuantityCart({cryptoFingerPrint, quantity: matchedInCart.quantity + 1})
    }
    if (type === 2) {
      this.props.history.push('order-first-step')
    } else if (type === 3) {
      this.props.history.push('checkout')
    } else {
      this.state = this.initialState
      await this.initialProductDetails()
    }
    this.successNotification()
  }
  async priceCalculation () {
    let objArr = []
    let obj = this.state
    for (var key in obj) { // loop the json object
      if (obj.hasOwnProperty(key)) {
        if (key !== 'totalPrice' && key !=='tempProduct' && key !=='allconfig' && key !== 'quantity') {
          if (isArray(obj[key])) {
            obj[key].map (dt => {
              return objArr.push({configId:(dt).toString()})
            })
          } else {
            objArr.push({configId:(obj[key]).toString()})
          }
        }
      }
    }
    let price = []
    await objArr.map(async oData => {
      let conPrice = await this.state.allconfig.find(allData => {
        return allData.id === oData.configId
      })
      await price.push(conPrice)
    })
    let finalCalPrice = this.state.tempProduct.Price
    await price.map(pCal=> {
      if (pCal) {
        finalCalPrice += pCal.adons.Price
      }
    })
    this.setState({totalPrice: finalCalPrice})
  
  }
  goBack () {
    this.props.history.push('order-first-step')
  }
  breadCrumbAction (val) {
    this.props.history.push(val)
  }
  successNotification() {
    Message({
      title: 'Success',
      message: 'Item is added to cart',
      type: 'success'
    })
  }


  render () {
    var styles = {
      marginTop: {
        margin: '3%',
        textAlign: 'left'
      }
    };
    let product = this.props.cartItem.tempProduct
    let displayAdons = product.ProductDetails.map ((data, key) => {

      let adonsData = []
      for (var keyData in data.Configurables) { // loop the json object
        if (data.Configurables.hasOwnProperty(keyData)) {
            adonsData.push({adons:data.Configurables[keyData], id: keyData})
        }
      }
      if (data.Multiple) { // check box
        return (<div className="column is-3" key={data.ConfigurationName+ key}>
        <span className="has-text-link" style={{fontWeight: 'bold'}}>{data.ConfigurationName}</span>
            {
              <Checkbox.Group className="orderSecond" size="large" value={this.state[data.ConfigurationName] || []} onChange={this.onChange.bind(this, data.ConfigurationName)}>
                {
                  adonsData.map ((adonInfo,aKey) => {
                    return <Checkbox.Button key={adonInfo.adons.Title+aKey} value={adonInfo.id} label={adonInfo.adons.Title + ' +' +adonInfo.adons.Price + 'Tk'}>hello</Checkbox.Button>
                  })
                }
             </Checkbox.Group>
            }
        </div>)
      } else { // radio box
        return (<div className="column is-3" key={data.ConfigurationName+ key}>{data.ConfigurationName}
            {
              <Radio.Group className="orderSecond" size="large" value={this.state[data.ConfigurationName]}  onChange={this.onChange.bind(this, data.ConfigurationName)}>
                {
                  adonsData.map ((adonInfo,aKey) => {
                    return <Radio.Button key={aKey} value={adonInfo.id}>{adonInfo.adons.Title + "+"+ adonInfo.adons.Price+"Tk" }</Radio.Button>
                  })
                }
             </Radio.Group>
            }
        </div>)
      }
    })

    return (
      <SiteLayout>
        <Breadcrumb separator="/">
          <Breadcrumb.Item><span onClick={this.breadCrumbAction.bind(this, '/home')}>Home</span></Breadcrumb.Item>
          <Breadcrumb.Item><span onClick={this.breadCrumbAction.bind(this, '/order-first-step')}>{this.props.cartItem.tempCategory.title}</span></Breadcrumb.Item>
          <Breadcrumb.Item>{this.state.tempProduct.Name}</Breadcrumb.Item>
        </Breadcrumb>
        <div className="columns is-right" key="price">
          <div className="column has-text-right">Price: <Tag>{this.state.totalPrice} Tk</Tag> </div>
        </div>
        <div className="columns is-multiline is-mobile" key="adons">
          {displayAdons}
        </div>
        <div className="columns orderPageButton">
          <div className="column">
            <button className="button is-warning is-large" style={{width: '100%'}} onClick={() => {this.goBack()}}>Back</button>
          </div>
          <div className="column">
            <button className="button is-primary is-large" style={{width: '100%'}} onClick={this.addToCartResetPage.bind(this, 1)}>Add to Cart</button>
          </div>
          <div className="column">
            <button className="button is-success is-large" style={{width: '100%'}} onClick={this.addToCartResetPage.bind(this, 3)}>Add & Checkout</button>
          </div>
        </div>
      </SiteLayout>
    )
  }
}
const mapStateToProps = state => ({
  cartItem: state.cart
})

const mapDispatchToProps = dispatch => ({
  cart: (cartItems) => dispatch({ type: 'cartItems', cartItems }),
  updateQuantityCart: (data) => dispatch({ type: 'updateQuantityCart', data }),
})
export default connect(mapStateToProps, mapDispatchToProps)(OrderSecondStep);  