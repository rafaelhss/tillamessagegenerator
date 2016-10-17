
var app = angular.module("tillaApp", []);


var atualizaTexto = function(postdata, valortag, prazotag, $scope, $http){
    $scope.carregando = true;
    $http.post("https://nocors.herokuapp.com/http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo", postdata, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
        }
    ).success(function (data, status) {
            $scope.carregando = false;
            var x2js = new X2JS();
            var xmlText = data;
            var jsonObj = x2js.xml_str2json(xmlText);

            console.log(jsonObj.cResultado.Servicos.cServico.Valor);

            var prazo = 0 + jsonObj.cResultado.Servicos.cServico.PrazoEntrega;
            var valor =  parseFloat("1.00") + parseFloat(jsonObj.cResultado.Servicos.cServico.Valor.replace(",",".")); //soma $1 pra caixa



            $scope.texto = $scope.texto.replace(valortag, valor.toFixed(2)).replace(prazotag, prazo);


        }).error(function (data, status) {
            $scope.carregando = false;
            $scope.prazo = -1;
            $scope.valor = -1;

        })
}

app.controller("tillaCtrl", function ($scope, $http) {

    $scope.texto = getTextoInicial();


    $scope.limpar = function () {
        $scope.texto = localStorage.getItem("texto");
    }

    $scope.limparStorage = function() {
        localStorage.removeItem("texto");
        $scope.texto = getTextoInicial();
    }




    $scope.frete = function (cep) {
        console.log(cep);

        if ($scope.texto.indexOf("[valor]") < 0 ||
            $scope.texto.indexOf("[prazo]") < 0 ||
            $scope.texto.indexOf("[valors]") < 0||
            $scope.texto.indexOf("[prazos]") < 0) {

            $scope.errotag = true;
        }
        else {
            $scope.errotag = false;

            localStorage.setItem("texto", $scope.texto);

            atualizaTexto(getDataPac(cep), '[valor]', '[prazo]', $scope, $http);
            atualizaTexto(getDataSedex(cep), '[valors]', '[prazos]', $scope, $http)

        }
    }



});


app.directive('selectOnClick', ['$window', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
    };
}]);


function getDataPac(cep) {
    return "nCdEmpresa=&sDsSenha=&nCdServico=41106&sCepOrigem=31160-440&sCepDestino=" + cep + "&nVlPeso=0.3&nCdFormato=1&nVlComprimento=18&nVlAltura=9&nVlLargura=27&nVlDiametro=0&sCdMaoPropria=&nVlValorDeclarado=0&sCdAvisoRecebimento=N";
}

function getDataSedex(cep) {
    return "nCdEmpresa=&sDsSenha=&nCdServico=40010 &sCepOrigem=31160-440&sCepDestino=" + cep + "&nVlPeso=0.3&nCdFormato=1&nVlComprimento=18&nVlAltura=9&nVlLargura=27&nVlDiametro=0&sCdMaoPropria=&nVlValorDeclarado=0&sCdAvisoRecebimento=N";
}

function getTextoInicial() {
    if(localStorage.getItem("texto") === null)
        return "O frete para seu CEP fica $[valor]. O prazo de entrega é de até [prazo] dias úteis via PAC. " +
            "Envio seguro com codigo de rastreio. (Se preferir SEDEX, fica $[valors] e chega em [prazos] dias uteis.)";
    else
        return localStorage.getItem("texto");    
}

