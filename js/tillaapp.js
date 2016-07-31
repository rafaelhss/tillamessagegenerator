
var app = angular.module("tillaApp", []);

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

        if ($scope.texto.indexOf("[valor]") < 0 || $scope.texto.indexOf("[prazo]") < 0) {
            $scope.errotag = true;
        }
        else {
            $scope.errotag = false;

            localStorage.setItem("texto", $scope.texto);


            $scope.carregando = true;
            $http.post("https://cors-anywhere.herokuapp.com/http://ws.correios.com.br/calculador/CalcPrecoPrazo.asmx/CalcPrecoPrazo", getData(cep), {
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



                $scope.texto = $scope.texto.replace("[valor]", valor.toFixed(2)).replace("[prazo]", prazo);




            }).error(function (data, status) {
                $scope.carregando = false;
                $scope.prazo = -1;
                $scope.valor = -1;

            })
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

function getData(cep) {
    return "nCdEmpresa=&sDsSenha=&nCdServico=41106&sCepOrigem=70873-060&sCepDestino=" + cep + "&nVlPeso=0.3&nCdFormato=1&nVlComprimento=16&nVlAltura=11&nVlLargura=16&nVlDiametro=0&sCdMaoPropria=&nVlValorDeclarado=0&sCdAvisoRecebimento=N";
}

function getTextoInicial() {
    if(localStorage.getItem("texto") === null)
        return "O frete para seu CEP fica $[valor]. O prazo de entrega é de até [prazo] dias úteis via PAC. Envio seguro com codigo de rastreio. Esse valor vale para até 20 caixas.";
    else
        return localStorage.getItem("texto");    
}

