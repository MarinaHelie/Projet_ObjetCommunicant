using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ServiceModel;

namespace ClasseMetier
{
    public class Class1
    {
        string ip = "192.168.1.101";
        int port = 49153;
        ServiceReference1.BasicServicePortTypeClient client = new ServiceReference1.BasicServicePortTypeClient();
        public Class1()
        {
            client.Endpoint.Address = new EndpointAddress(string.Format("http://{0}:{1}/upnp/control/basicevent1", ip, port));

            ServiceReference1.GetBinaryStateResponse state = client.GetBinaryState(new ServiceReference1.GetBinaryState());
            Console.WriteLine("Switch is current set to: {0}", state.BinaryState);

            Console.WriteLine("Turning Switch On");
            ServiceReference1.SetBinaryState msg = new ServiceReference1.SetBinaryState { BinaryState = "1" };
            client.SetBinaryState(msg);
        } 
    }
}
