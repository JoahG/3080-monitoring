const express = require('express'),
      axios = require('axios');

const app = express();

const TWENTYSIXTY = `5379432500`;
const THIRTYEIGHTY = `5438481700`;

const getAccessToken = async () => {
  let response = await axios.get(`https://store.nvidia.com/store/nvidia/SessionToken?format=json&locale=en_us&apiKey=9485fa7b159e42edb08a83bde0d83dia&currency=USD&_=${ Date.now() }`);

  return response.data.access_token;
}

const getCheckoutAvailable = async (token, productId) => {
  try {
    let response = await axios.get(`https://api.digitalriver.com/v1/shoppers/me/carts/active/line-items?format=json&method=post&productId=${ productId }&quantity=1&token=${ token }&_=${ Date.now() }`)

    return true;
  } catch(e) {
    return false;
  }
}

const getAvailableQuantity = async (productId) => {
  let response = await axios.get(`https://in-and-ru-store-api.uk-e1.cloudhub.io/DR/get-inventory/en_us/${ productId }`);

  return response.data.Product.availableQuantity;
}

const execute = async () => {
  try {
    let token = await getAccessToken();

    return {
      '2060 SUPER': {
        'Checkout Available': await getCheckoutAvailable(token, TWENTYSIXTY),
        'Available Quantity': await getAvailableQuantity(TWENTYSIXTY)
      },
      '3080 FE': {
        'Checkout Available': await getCheckoutAvailable(token, THIRTYEIGHTY),
        'Available Quantity': await getAvailableQuantity(THIRTYEIGHTY)
      }
    };
  } catch (e) {
    console.error(e);

    return {
      'error': "idk lol something went wrong"
    }
  }
}

const thirtyEightyCheckoutAvailable = async() => {
  try {
    let token = await getAccessToken();

    return await getCheckoutAvailable(token, THIRTYEIGHTY);
  } catch(e) {
    return false;
  }
}


app.get('/', (req, res) => {
  res.set('Content-Type', 'application/json');

  execute().then((data) => {
    res.send(JSON.stringify(data, null, 2));
  }).catch((e) => {
    console.error(e);
    res.json({ error: 'idk lol something went wrong' });
  });
});

app.get(`/check`, (req, res) => {
  thirtyEightyCheckoutAvailable().then((checkoutAvailable) => {
    if (checkoutAvailable) {
      res.status(420).send(`Let's go boyyy`);
    } else {
      res.status(200).send('Checkout still unavailable');
    }
  })
})

app.listen(process.env.PORT || 3000);
